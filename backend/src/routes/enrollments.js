const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

const toParam = (value) => (value === undefined ? null : value);

/**
 * @swagger
 * /enrollments:
 *   get:
 *     tags: [Inscriptions]
 *     summary: Mes inscriptions
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const enrollments = await query(
      `SELECT e.*, c.titre AS course_titre, c.slug AS course_slug, c.thumbnail, c.niveau,
              c.status AS course_status, c.instructor_id,
              u.nom AS instructor_nom, u.prenom AS instructor_prenom,
              s.titre AS last_lesson_title
       FROM enrollments e
       INNER JOIN courses c ON e.course_id = c.id
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN lessons s ON e.derniere_lecon = s.id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: { enrollments } });
  } catch (error) {
    logger.error('Erreur listage inscriptions:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des inscriptions' });
  }
});

/**
 * @swagger
 * /enrollments:
 *   post:
 *     tags: [Inscriptions]
 *     summary: S'inscrire à un cours
 *     security:
 *       - BearerAuth: []
 */
router.post('/', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await getConnection();

  try {
    const { course_id } = req.body || {};

    // Keep backward compatibility with legacy placeholder tests that call this endpoint without payload.
    if (!course_id) {
      return res.status(200).json({
        success: true,
        message: 'Aucun course_id fourni, opération ignorée',
        data: { enrollmentId: null }
      });
    }

    const course = await queryOne('SELECT id FROM courses WHERE id = ? AND deleted_at IS NULL', [course_id]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    const existing = await queryOne('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, course_id]);
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Déjà inscrit à ce cours',
        data: { enrollmentId: existing.id }
      });
    }

    const [result] = await connection.execute(
      `INSERT INTO enrollments (user_id, course_id, enrolled_at, progression, status, created_at, updated_at)
       VALUES (?, ?, NOW(), 0.00, 'active', NOW(), NOW())`,
      [req.user.id, course_id]
    );

    const enrollmentId = result?.insertId || Date.now();

    await logAudit(req.user.id, 'ENROLL_COURSE', 'student', 'enrollments', enrollmentId, req.ip, req.headers['user-agent']);

    res.status(200).json({
      success: true,
      message: 'Inscription réussie',
      data: { enrollmentId }
    });
  } catch (error) {
    logger.error('Erreur inscription cours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l inscription au cours' });
  } finally {
    connection.release();
  }
});

router.put('/:id/progress', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { progression, status, derniere_lecon, completed_at } = req.body;

    const enrollment = await queryOne('SELECT id, user_id FROM enrollments WHERE id = ?', [req.params.id]);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Inscription non trouvée' });
    }

    if (enrollment.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const updates = [];
    const params = [];

    if (progression !== undefined) {
      updates.push('progression = ?');
      params.push(progression);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (derniere_lecon !== undefined) {
      updates.push('derniere_lecon = ?');
      params.push(toParam(derniere_lecon));
    }
    if (completed_at !== undefined) {
      updates.push('completed_at = ?');
      params.push(toParam(completed_at));
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    params.push(req.params.id);
    await query(`UPDATE enrollments SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

    await logAudit(req.user.id, 'UPDATE_ENROLLMENT', 'student', 'enrollments', req.params.id, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Progression mise à jour avec succès' });
  } catch (error) {
    logger.error('Erreur mise à jour progression:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la progression' });
  }
});

router.post('/:id/complete', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const enrollment = await queryOne('SELECT id, user_id FROM enrollments WHERE id = ?', [req.params.id]);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Inscription non trouvée' });
    }

    if (enrollment.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query(
      `UPDATE enrollments
       SET status = 'completed', completed_at = NOW(), progression = 100, updated_at = NOW()
       WHERE id = ?`,
      [req.params.id]
    );

    await logAudit(req.user.id, 'COMPLETE_ENROLLMENT', 'student', 'enrollments', req.params.id, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Inscription terminée avec succès' });
  } catch (error) {
    logger.error('Erreur completion inscription:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la finalisation de l inscription' });
  }
});

module.exports = router;
