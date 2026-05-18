const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { lesson_id } = req.query;
    if (!lesson_id) {
      return res.status(400).json({ success: false, message: 'lesson_id requis' });
    }

    const resources = await query(
      `SELECT r.*, l.titre AS lesson_titre
       FROM resources r
       INNER JOIN lessons l ON r.lesson_id = l.id
       WHERE r.lesson_id = ?
       ORDER BY r.ordre ASC, r.created_at ASC`,
      [lesson_id]
    );

    res.json({ success: true, data: { resources } });
  } catch (error) {
    logger.error('Erreur listage ressources:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des ressources' });
  }
});

router.post('/', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  const connection = await getConnection();
  try {
    const { lesson_id, type, titre, url, taille_ko, duree_sec, ordre, is_telechar } = req.body;
    if (!lesson_id || !type || !titre || !url) {
      return res.status(400).json({ success: false, message: 'lesson_id, type, titre et url requis' });
    }

    const lesson = await queryOne('SELECT id FROM lessons WHERE id = ?', [lesson_id]);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    const [result] = await connection.execute(
      `INSERT INTO resources (lesson_id, type, titre, url, taille_ko, duree_sec, ordre, is_telechar, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [lesson_id, type, titre, url, taille_ko || null, duree_sec || null, ordre || 0, is_telechar ? 1 : 0]
    );

    await logAudit(req.user.id, 'CREATE_RESOURCE', 'cours', 'resources', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Ressource créée', data: { resourceId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création ressource:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la ressource' });
  } finally {
    connection.release();
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const resource = await queryOne('SELECT id FROM resources WHERE id = ?', [req.params.id]);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Ressource non trouvée' });
    }

    await query('DELETE FROM resources WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_RESOURCE', 'cours', 'resources', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Ressource supprimée' });
  } catch (error) {
    logger.error('Erreur suppression ressource:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la ressource' });
  }
});

module.exports = router;
