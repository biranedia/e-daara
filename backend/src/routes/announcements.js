const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { course_id } = req.query;
    let sql = `
      SELECT a.*, c.titre AS course_titre, u.nom AS auteur_nom, u.prenom AS auteur_prenom
      FROM announcements a
      INNER JOIN courses c ON a.course_id = c.id
      INNER JOIN users u ON a.auteur_id = u.id
      WHERE 1 = 1
    `;
    const params = [];

    if (course_id) {
      sql += ' AND a.course_id = ?';
      params.push(course_id);
    }

    sql += ' ORDER BY a.created_at DESC LIMIT 200';
    const announcements = await query(sql, params);
    res.json({ success: true, data: { announcements } });
  } catch (error) {
    logger.error('Erreur listage annonces:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des annonces' });
  }
});

router.post('/', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  const connection = await getConnection();
  try {
    const { course_id, titre, corps } = req.body;
    if (!course_id || !titre || !corps) {
      return res.status(400).json({ success: false, message: 'course_id, titre et corps requis' });
    }

    const course = await queryOne('SELECT id FROM courses WHERE id = ? AND deleted_at IS NULL', [course_id]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    const [result] = await connection.execute(
      `INSERT INTO announcements (course_id, auteur_id, titre, corps, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [course_id, req.user.id, titre, corps]
    );

    await logAudit(req.user.id, 'CREATE_ANNOUNCEMENT', 'communication', 'announcements', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Annonce créée', data: { announcementId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création annonce:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de l annonce' });
  } finally {
    connection.release();
  }
});

router.put('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const announcement = await queryOne('SELECT id, auteur_id FROM announcements WHERE id = ?', [req.params.id]);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }
    if (announcement.auteur_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { titre, corps } = req.body;
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

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    params.push(req.params.id);
    await query(`UPDATE announcements SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_ANNOUNCEMENT', 'communication', 'announcements', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Annonce mise à jour' });
  } catch (error) {
    logger.error('Erreur mise à jour annonce:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l annonce' });
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  try {
    const announcement = await queryOne('SELECT id, auteur_id FROM announcements WHERE id = ?', [req.params.id]);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }
    if (announcement.auteur_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_ANNOUNCEMENT', 'communication', 'announcements', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Annonce supprimée' });
  } catch (error) {
    logger.error('Erreur suppression annonce:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l annonce' });
  }
});

module.exports = router;
