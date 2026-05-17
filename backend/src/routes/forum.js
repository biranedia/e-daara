const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, logAudit } = require('../middlewares/rbac');
const { query, queryOne, pool } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { course_id, lesson_id } = req.query;
    let sql = `
      SELECT fp.*, c.titre AS course_titre, l.titre AS lesson_titre, u.nom AS auteur_nom, u.prenom AS auteur_prenom
      FROM forum_posts fp
      INNER JOIN courses c ON fp.course_id = c.id
      LEFT JOIN lessons l ON fp.lesson_id = l.id
      INNER JOIN users u ON fp.auteur_id = u.id
      WHERE fp.parent_id IS NULL
    `;
    const params = [];
    if (course_id) {
      sql += ' AND fp.course_id = ?';
      params.push(course_id);
    }
    if (lesson_id) {
      sql += ' AND fp.lesson_id = ?';
      params.push(lesson_id);
    }
    sql += ' ORDER BY fp.epingle DESC, fp.created_at DESC LIMIT 200';
    const posts = await query(sql, params);
    res.json({ success: true, data: { posts } });
  } catch (error) {
    logger.error('Erreur listage forum:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement du forum' });
  }
});

router.get('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const post = await queryOne(
      `SELECT fp.*, c.titre AS course_titre, l.titre AS lesson_titre, u.nom AS auteur_nom, u.prenom AS auteur_prenom
       FROM forum_posts fp
       INNER JOIN courses c ON fp.course_id = c.id
       LEFT JOIN lessons l ON fp.lesson_id = l.id
       INNER JOIN users u ON fp.auteur_id = u.id
       WHERE fp.id = ?`,
      [req.params.id]
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }

    const replies = await query(
      `SELECT fp.*, u.nom AS auteur_nom, u.prenom AS auteur_prenom
       FROM forum_posts fp
       INNER JOIN users u ON fp.auteur_id = u.id
       WHERE fp.parent_id = ?
       ORDER BY fp.created_at ASC`,
      [req.params.id]
    );

    res.json({ success: true, data: { post, replies } });
  } catch (error) {
    logger.error('Erreur lecture forum:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement du post' });
  }
});

router.post('/', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { course_id, lesson_id, parent_id, titre, corps } = req.body;
    if (!course_id || !corps) {
      return res.status(400).json({ success: false, message: 'course_id et corps requis' });
    }

    const course = await queryOne('SELECT id FROM courses WHERE id = ? AND deleted_at IS NULL', [course_id]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    const [result] = await connection.execute(
      `INSERT INTO forum_posts (course_id, lesson_id, auteur_id, parent_id, titre, corps, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [course_id, lesson_id || null, req.user.id, parent_id || null, titre || null, corps]
    );

    await logAudit(req.user.id, 'CREATE_FORUM_POST', 'communication', 'forum_posts', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Post créé', data: { postId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création forum:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du post' });
  } finally {
    connection.release();
  }
});

router.put('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const post = await queryOne('SELECT id, auteur_id FROM forum_posts WHERE id = ?', [req.params.id]);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }
    if (post.auteur_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { titre, corps, epingle, resolu } = req.body;
    const updates = [];
    const params = [];
    if (titre !== undefined) {
      updates.push('titre = ?');
      params.push(titre);
    }
    if (corps !== undefined) {
      updates.push('corps = ?');
      params.push(corps);
    }
    if (epingle !== undefined) {
      updates.push('epingle = ?');
      params.push(epingle ? 1 : 0);
    }
    if (resolu !== undefined) {
      updates.push('resolu = ?');
      params.push(resolu ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    params.push(req.params.id);
    await query(`UPDATE forum_posts SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_FORUM_POST', 'communication', 'forum_posts', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Post mis à jour' });
  } catch (error) {
    logger.error('Erreur mise à jour forum:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du post' });
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const post = await queryOne('SELECT id, auteur_id FROM forum_posts WHERE id = ?', [req.params.id]);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }
    if (post.auteur_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('DELETE FROM forum_posts WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_FORUM_POST', 'communication', 'forum_posts', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Post supprimé' });
  } catch (error) {
    logger.error('Erreur suppression forum:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du post' });
  }
});

module.exports = router;
