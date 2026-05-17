const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, pool } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

const toParam = (value) => (value === undefined ? null : value);
const slugify = (value) => (value || '')
  .toString()
  .toLowerCase()
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]/g, '')
  .replace(/-+/g, '-')
  .substring(0, 255);

/**
 * @swagger
 * /lessons:
 *   get:
 *     tags: [Leçons]
 *     summary: Lister les leçons
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { course_id, section_id, status } = req.query;

    let sql = `
      SELECT l.*, s.titre AS section_titre, c.titre AS course_titre
      FROM lessons l
      LEFT JOIN sections s ON l.section_id = s.id
      LEFT JOIN courses c ON l.course_id = c.id
      WHERE 1 = 1
    `;
    const params = [];

    if (course_id) {
      sql += ' AND l.course_id = ?';
      params.push(course_id);
    }
    if (section_id) {
      sql += ' AND l.section_id = ?';
      params.push(section_id);
    }
    if (status) {
      sql += ' AND l.status = ?';
      params.push(status);
    }

    if (!req.user.roles.includes('admin') && !req.user.roles.includes('instructor')) {
      sql += " AND l.status = 'published'";
    }

    sql += ' ORDER BY l.ordre ASC, l.created_at DESC';

    const lessons = await query(sql, params);
    res.json({ success: true, data: { lessons } });
  } catch (error) {
    logger.error('Erreur listage leçons:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des leçons' });
  }
});

router.get('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const lesson = await queryOne(
      `SELECT l.*, s.titre AS section_titre, c.titre AS course_titre
       FROM lessons l
       LEFT JOIN sections s ON l.section_id = s.id
       LEFT JOIN courses c ON l.course_id = c.id
       WHERE l.id = ?`,
      [req.params.id]
    );

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    if (lesson.status !== 'published' && !req.user.roles.includes('admin') && !req.user.roles.includes('instructor')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const resources = await query('SELECT * FROM resources WHERE lesson_id = ? ORDER BY ordre ASC', [lesson.id]);
    res.json({ success: true, data: { lesson, resources } });
  } catch (error) {
    logger.error('Erreur lecture leçon:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de la leçon' });
  }
});

router.post('/', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const { section_id, course_id, titre, description, contenu, duree, ordre, is_free, status } = req.body;

    if (!section_id || !course_id || !titre) {
      return res.status(400).json({ success: false, message: 'section_id, course_id et titre requis' });
    }

    const section = await queryOne('SELECT id FROM sections WHERE id = ? AND course_id = ?', [section_id, course_id]);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section non trouvée pour ce cours' });
    }

    const baseSlug = slugify(titre) || `lesson-${Date.now()}`;
    let finalSlug = baseSlug;
    let lessonId = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const [result] = await pool.execute(
          `INSERT INTO lessons
           (section_id, course_id, titre, slug, description, contenu, duree, ordre, is_free, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [section_id, course_id, titre, finalSlug, toParam(description), toParam(contenu), toParam(duree), toParam(ordre), is_free ? 1 : 0, status || 'draft']
        );
        lessonId = result.insertId;
        break;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          finalSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}-${Date.now().toString().slice(-4)}`;
          continue;
        }
        throw error;
      }
    }

    if (!lessonId) {
      throw new Error('Impossible de créer la leçon après plusieurs tentatives');
    }

    await logAudit(req.user.id, 'CREATE_LESSON', 'cours', 'lessons', lessonId, req.ip, req.headers['user-agent']);

    res.status(201).json({ success: true, message: 'Leçon créée avec succès', data: { lessonId } });
  } catch (error) {
    logger.error('Erreur création leçon:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la leçon' });
  }
});

router.put('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const lesson = await queryOne('SELECT id FROM lessons WHERE id = ?', [req.params.id]);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    const { titre, description, contenu, duree, ordre, is_free, status, section_id } = req.body;
    const updates = [];
    const params = [];

    if (titre !== undefined) {
      updates.push('titre = ?');
      params.push(titre);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(toParam(description));
    }
    if (contenu !== undefined) {
      updates.push('contenu = ?');
      params.push(toParam(contenu));
    }
    if (duree !== undefined) {
      updates.push('duree = ?');
      params.push(toParam(duree));
    }
    if (ordre !== undefined) {
      updates.push('ordre = ?');
      params.push(toParam(ordre));
    }
    if (is_free !== undefined) {
      updates.push('is_free = ?');
      params.push(is_free ? 1 : 0);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (section_id !== undefined) {
      updates.push('section_id = ?');
      params.push(section_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    params.push(req.params.id);
    await query(`UPDATE lessons SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

    await logAudit(req.user.id, 'UPDATE_LESSON', 'cours', 'lessons', req.params.id, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Leçon mise à jour avec succès' });
  } catch (error) {
    logger.error('Erreur mise à jour leçon:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la leçon' });
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const lesson = await queryOne('SELECT id FROM lessons WHERE id = ?', [req.params.id]);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    await query('DELETE FROM lessons WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_LESSON', 'cours', 'lessons', req.params.id, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Leçon supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur suppression leçon:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la leçon' });
  }
});

module.exports = router;
