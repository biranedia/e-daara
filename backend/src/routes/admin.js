/**
 * Routes d'administration
 * Gestion des utilisateurs, validation des cours, statistiques
 */

const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne } = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Administration]
 *     summary: Statistiques globales
 *     security:
 *       - BearerAuth: []
 */
router.get('/dashboard', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const [stats, recentUsers, recentLogs] = await Promise.all([
      queryOne(
        `SELECT
          (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) AS total_users,
          (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
          (SELECT COUNT(*) FROM users WHERE status = 'inactive') AS inactive_users,
          (SELECT COUNT(*) FROM users WHERE status = 'suspended') AS suspended_users,
          (SELECT COUNT(*) FROM courses WHERE status = 'published') AS published_courses,
          (SELECT COUNT(*) FROM courses WHERE status = 'pending') AS pending_courses,
          (SELECT COUNT(*) FROM courses WHERE status = 'draft') AS draft_courses,
          (SELECT COUNT(*) FROM enrollments) AS total_enrollments,
          (SELECT COUNT(*) FROM enrollments WHERE status = 'completed') AS completed_enrollments,
          (SELECT COUNT(*) FROM quiz_results) AS total_quiz_submissions
        FROM dual`
      ),
      query(
        `SELECT id, nom, prenom, email, status, created_at
         FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 6`
      ),
      query(
        `SELECT l.action, l.module, COALESCE(u.email, 'système') AS email,
                l.created_at, l.statut
         FROM audit_logs l LEFT JOIN users u ON l.user_id = u.id
         ORDER BY l.created_at DESC LIMIT 8`
      )
    ]);

    res.json({ success: true, data: { ...stats, recent_users: recentUsers, recent_logs: recentLogs } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur' });
  }
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Administration]
 *     summary: Lister tous les utilisateurs
 *     security:
 *       - BearerAuth: []
 */
router.get('/users', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const users = await query(
      `SELECT id, email, nom, prenom, status, created_at, last_login_at
       FROM users
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 100`
    );

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur'
    });
  }
});

/**
 * @swagger
 * /admin/users/{id}/status:
 *   put:
 *     tags: [Administration]
 *     summary: Changer le statut d'un utilisateur
 *     security:
 *       - BearerAuth: []
 */
router.put('/users/:id/status', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    await query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    await logAudit(req.user.id, 'UPDATE_USER_STATUS', 'admin', 'users', req.params.id, req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      message: 'Statut utilisateur mis à jour'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur'
    });
  }
});

/**
 * @swagger
 * /admin/courses/pending:
 *   get:
 *     tags: [Administration]
 *     summary: Lister les cours en attente de validation
 *     security:
 *       - BearerAuth: []
 */
router.get('/courses/pending', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const courses = await query(
      `SELECT c.id, c.titre, c.description, c.status,
              u.nom as instructor_nom, u.prenom as instructor_prenom, u.email,
              c.created_at
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.status = 'pending'
       ORDER BY c.created_at ASC`
    );

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur'
    });
  }
});

/**
 * @swagger
 * /admin/courses/{id}/validate:
 *   post:
 *     tags: [Administration]
 *     summary: Valider ou refuser un cours
 *     security:
 *       - BearerAuth: []
 */
router.post('/courses/:id/validate', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const { decision, commentaire } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Décision invalide (approved ou rejected)'
      });
    }

    const newStatus = decision === 'approved' ? 'published' : 'draft';

    await query(
      'UPDATE courses SET status = ? WHERE id = ?',
      [newStatus, req.params.id]
    );

    await query(
      `INSERT INTO course_validations (course_id, admin_id, decision, commentaire, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [req.params.id, req.user.id, decision, commentaire]
    );

    await logAudit(req.user.id, `VALIDATE_COURSE_${decision}`, 'admin', 'courses', req.params.id, req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      message: `Cours ${decision === 'approved' ? 'approuvé' : 'rejeté'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur'
    });
  }
});

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     tags: [Administration]
 *     summary: Consulter les logs d'audit
 *     security:
 *       - BearerAuth: []
 */
router.get('/audit-logs', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const logs = await query(
      `SELECT l.id, l.user_id, u.email, l.action, l.module as module, l.resource_type as resource_type, l.resource_id,
              l.ip_address, l.statut, l.detail, l.created_at
       FROM audit_logs l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT 1000`
    );

    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur'
    });
  }
});

module.exports = router;
