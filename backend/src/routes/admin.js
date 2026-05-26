/**
 * Routes d'administration
 * Gestion des utilisateurs, validation des cours, statistiques
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

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
      `SELECT u.id, u.email, u.nom, u.prenom, u.status, u.created_at, u.last_login_at,
              GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ',') AS roles_str
       FROM users u
       LEFT JOIN user_role ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       WHERE u.deleted_at IS NULL
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT 200`
    );
    const enriched = users.map(u => ({
      ...u,
      roles: u.roles_str ? u.roles_str.split(',') : [],
      roles_str: undefined
    }));

    res.json({ success: true, data: { users: enriched } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur' });
  }
});

/**
 * @swagger
 * /admin/users:
 *   post:
 *     tags: [Administration]
 *     summary: Créer un utilisateur (admin)
 *     security:
 *       - BearerAuth: []
 */
router.post('/users', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  const conn = await getConnection();
  try {
    const { nom, prenom, email, password, roles: reqRoles } = req.body;

    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'nom, prenom, email et password sont requis'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email déjà enregistré',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    await conn.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await conn.execute(
      `INSERT INTO users (nom, prenom, email, password, provider, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'local', 'active', NOW(), NOW())`,
      [nom, prenom, email, hashedPassword]
    );
    const userId = result.insertId;

    // Assigner les rôles (student par défaut si aucun fourni)
    const allowedRoles = ['student', 'instructor', 'admin'];
    const validRoles = Array.isArray(reqRoles) && reqRoles.length
      ? reqRoles.filter(r => allowedRoles.includes(r))
      : ['student'];

    if (validRoles.length) {
      const placeholders = validRoles.map(() => '?').join(',');
      const roleRows = await query(`SELECT id FROM roles WHERE name IN (${placeholders})`, validRoles);
      for (const role of roleRows) {
        await conn.execute('INSERT INTO user_role (user_id, role_id) VALUES (?, ?)', [userId, role.id]);
      }
    }

    // Créer le profil apprenant
    await conn.execute(
      'INSERT INTO learner_profiles (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())',
      [userId]
    );

    await conn.commit();
    await logAudit(req.user.id, 'CREATE_USER', 'admin', 'users', userId, req.ip, req.headers['user-agent']);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: { userId }
    });
  } catch (error) {
    await conn.rollback();
    logger.error('Erreur création utilisateur admin:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création' });
  } finally {
    conn.release();
  }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     tags: [Administration]
 *     summary: Modifier les informations d'un utilisateur
 *     security:
 *       - BearerAuth: []
 */
router.put('/users/:id', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { nom, prenom, email, password } = req.body;

    const user = await queryOne(
      'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const updates = [];
    const params = [];

    if (nom)   { updates.push('nom = ?');   params.push(nom); }
    if (prenom){ updates.push('prenom = ?'); params.push(prenom); }

    if (email) {
      const emailTaken = await queryOne(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (emailTaken) {
        return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
      }
      updates.push('email = ?');
      params.push(email);
    }

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' });
      }
      const hashed = await bcrypt.hash(password, 12);
      updates.push('password = ?');
      params.push(hashed);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'Aucun champ à modifier' });
    }

    params.push(userId);
    await query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_USER', 'admin', 'users', userId, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    logger.error('Erreur mise à jour utilisateur admin:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
  }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     tags: [Administration]
 *     summary: Supprimer un utilisateur (soft delete)
 *     security:
 *       - BearerAuth: []
 */
router.delete('/users/:id', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    const user = await queryOne(
      'SELECT id, email FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Soft delete : on marque le compte comme supprimé + on le désactive
    await query(
      `UPDATE users SET deleted_at = NOW(), status = 'inactive', updated_at = NOW() WHERE id = ?`,
      [userId]
    );

    await logAudit(req.user.id, 'DELETE_USER', 'admin', 'users', userId, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: `Utilisateur ${user.email} supprimé avec succès` });
  } catch (error) {
    logger.error('Erreur suppression utilisateur admin:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
});

router.put('/users/:id/roles', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { roles } = req.body; // e.g. ['instructor'] or ['student','instructor']
    if (!Array.isArray(roles)) {
      return res.status(400).json({ success: false, message: 'roles doit être un tableau' });
    }
    const allowed = ['student', 'instructor', 'admin'];
    if (roles.some(r => !allowed.includes(r))) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    // Fetch role IDs
    let roleIds = [];
    if (roles.length) {
      const placeholders = roles.map(() => '?').join(',');
      const roleRows = await query(`SELECT id, name FROM roles WHERE name IN (${placeholders})`, roles);
      roleIds = roleRows.map(r => r.id);
    }

    // Replace all roles for this user
    await query('DELETE FROM user_role WHERE user_id = ?', [userId]);
    for (const rid of roleIds) {
      await query('INSERT INTO user_role (user_id, role_id) VALUES (?, ?)', [userId, rid]);
    }

    await logAudit(req.user.id, 'UPDATE_USER_ROLES', 'admin', 'users', userId, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Rôles mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur' });
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
 * GET /admin/courses/validations — Historique des validations automatiques
 * Retourne les 200 dernières entrées de course_validations (auto + manuelles).
 */
router.get('/courses/validations', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const validations = await query(
      `SELECT cv.id, cv.course_id, cv.decision, cv.commentaire, cv.created_at,
              c.titre AS course_titre, c.status AS course_status,
              c.niveau, c.duree,
              u.nom AS instructor_nom, u.prenom AS instructor_prenom,
              CASE WHEN cv.admin_id IS NULL THEN 'auto' ELSE 'manual' END AS source
       FROM course_validations cv
       LEFT JOIN courses c ON cv.course_id = c.id
       LEFT JOIN users u ON c.instructor_id = u.id
       ORDER BY cv.created_at DESC
       LIMIT 200`
    );
    res.json({ success: true, data: { validations } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur' });
  }
});

/**
 * @swagger
 * /admin/courses/{id}/validate:
 *   post:
 *     tags: [Administration]
 *     summary: Valider ou refuser un cours manuellement (fallback admin)
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
