const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/lessons', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const progress = await query(
      `SELECT lp.*, l.titre AS lesson_titre, e.course_id
       FROM lesson_progress lp
       INNER JOIN lessons l ON lp.lesson_id = l.id
       INNER JOIN enrollments e ON lp.enrollment_id = e.id
       WHERE lp.user_id = ?
       ORDER BY lp.updated_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: { progress } });
  } catch (error) {
    logger.error('Erreur progression leçons:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de la progression' });
  }
});

router.post('/lessons', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await getConnection();
  try {
    const { lesson_id, enrollment_id, completed, temps_passe } = req.body;
    if (!lesson_id || !enrollment_id) {
      return res.status(400).json({ success: false, message: 'lesson_id et enrollment_id requis' });
    }

    const enrollment = await queryOne('SELECT id, user_id FROM enrollments WHERE id = ?', [enrollment_id]);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Inscription non trouvée' });
    }

    if (enrollment.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const [result] = await connection.execute(
      `INSERT INTO lesson_progress (user_id, lesson_id, enrollment_id, completed, completed_at, temps_passe, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE completed = VALUES(completed), completed_at = VALUES(completed_at), temps_passe = VALUES(temps_passe), updated_at = NOW()`,
      [req.user.id, lesson_id, enrollment_id, completed ? 1 : 0, completed ? new Date() : null, temps_passe || 0]
    );

    await query('UPDATE enrollments SET derniere_lecon = ?, updated_at = NOW() WHERE id = ?', [lesson_id, enrollment_id]);
    await logAudit(req.user.id, 'UPDATE_LESSON_PROGRESS', 'progression', 'lesson_progress', null, req.ip, req.headers['user-agent']);

    res.status(200).json({ success: true, message: 'Progression enregistrée', data: { affectedRows: result.affectedRows || 1 } });
  } catch (error) {
    logger.error('Erreur enregistrement progression:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l enregistrement de la progression' });
  } finally {
    connection.release();
  }
});

router.get('/paths', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const progress = await query(
      `SELECT pe.*, p.titre AS path_titre
       FROM path_enrollments pe
       INNER JOIN paths p ON pe.path_id = p.id
       WHERE pe.user_id = ?
       ORDER BY pe.updated_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: { progress } });
  } catch (error) {
    logger.error('Erreur progression parcours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de la progression des parcours' });
  }
});

router.post('/paths', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await getConnection();
  try {
    const { path_id } = req.body;
    if (!path_id) {
      return res.status(400).json({ success: false, message: 'path_id requis' });
    }

    const path = await queryOne('SELECT id FROM paths WHERE id = ? AND deleted_at IS NULL', [path_id]);
    if (!path) {
      return res.status(404).json({ success: false, message: 'Parcours non trouvé' });
    }

    const existing = await queryOne('SELECT id FROM path_enrollments WHERE user_id = ? AND path_id = ?', [req.user.id, path_id]);
    if (existing) {
      return res.status(200).json({ success: true, message: 'Déjà inscrit à ce parcours', data: { pathEnrollmentId: existing.id } });
    }

    const [result] = await connection.execute(
      `INSERT INTO path_enrollments (user_id, path_id, enrolled_at, progression, status, created_at, updated_at)
       VALUES (?, ?, NOW(), 0.00, 'active', NOW(), NOW())`,
      [req.user.id, path_id]
    );

    await logAudit(req.user.id, 'ENROLL_PATH', 'progression', 'path_enrollments', result.insertId, req.ip, req.headers['user-agent']);
    res.status(200).json({ success: true, message: 'Inscription au parcours réussie', data: { pathEnrollmentId: result.insertId } });
  } catch (error) {
    logger.error('Erreur inscription parcours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l inscription au parcours' });
  } finally {
    connection.release();
  }
});

router.put('/paths/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const enrollment = await queryOne('SELECT id, user_id FROM path_enrollments WHERE id = ?', [req.params.id]);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Inscription parcours non trouvée' });
    }

    if (enrollment.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { progression, status, completed_at } = req.body;
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
    if (completed_at !== undefined) {
      updates.push('completed_at = ?');
      params.push(completed_at);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    params.push(req.params.id);
    await query(`UPDATE path_enrollments SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_PATH_PROGRESS', 'progression', 'path_enrollments', req.params.id, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Progression parcours mise à jour' });
  } catch (error) {
    logger.error('Erreur mise à jour progression parcours:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la progression du parcours' });
  }
});

module.exports = router;
