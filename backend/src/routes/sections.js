const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, pool } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { course_id } = req.query;
    if (!course_id) {
      return res.status(400).json({ success: false, message: 'course_id requis' });
    }

    const sections = await query(
      `SELECT s.*, c.titre AS course_titre,
              (SELECT COUNT(*) FROM lessons l WHERE l.section_id = s.id) AS nb_lessons
       FROM sections s
       INNER JOIN courses c ON s.course_id = c.id
       WHERE s.course_id = ?
       ORDER BY s.ordre ASC, s.created_at ASC`,
      [course_id]
    );

    res.json({ success: true, data: { sections } });
  } catch (error) {
    logger.error('Erreur listage sections:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des sections' });
  }
});

router.get('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const section = await queryOne('SELECT * FROM sections WHERE id = ?', [req.params.id]);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section non trouvée' });
    }

    const lessons = await query('SELECT * FROM lessons WHERE section_id = ? ORDER BY ordre ASC, created_at ASC', [req.params.id]);
    res.json({ success: true, data: { section, lessons } });
  } catch (error) {
    logger.error('Erreur lecture section:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de la section' });
  }
});

router.post('/', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { course_id, titre, description, ordre } = req.body;
    if (!course_id || !titre) {
      return res.status(400).json({ success: false, message: 'course_id et titre requis' });
    }

    const course = await queryOne('SELECT id, instructor_id FROM courses WHERE id = ? AND deleted_at IS NULL', [course_id]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    if (course.instructor_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const [result] = await connection.execute(
      `INSERT INTO sections (course_id, titre, description, ordre, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [course_id, titre, description || null, ordre || 0]
    );

    await logAudit(req.user.id, 'CREATE_SECTION', 'cours', 'sections', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Section créée', data: { sectionId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création section:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la section' });
  } finally {
    connection.release();
  }
});

router.put('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const section = await queryOne('SELECT id, course_id FROM sections WHERE id = ?', [req.params.id]);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section non trouvée' });
    }

    const { titre, description, ordre } = req.body;
    const updates = [];
    const params = [];
    if (titre !== undefined) { updates.push('titre = ?'); params.push(titre); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (ordre !== undefined) { updates.push('ordre = ?'); params.push(ordre); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    params.push(req.params.id);
    await query(`UPDATE sections SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_SECTION', 'cours', 'sections', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Section mise à jour' });
  } catch (error) {
    logger.error('Erreur mise à jour section:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la section' });
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const section = await queryOne('SELECT id FROM sections WHERE id = ?', [req.params.id]);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section non trouvée' });
    }

    await query('DELETE FROM sections WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_SECTION', 'cours', 'sections', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Section supprimée' });
  } catch (error) {
    logger.error('Erreur suppression section:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la section' });
  }
});

module.exports = router;
