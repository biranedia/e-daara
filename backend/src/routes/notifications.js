const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

const toParam = (value) => (value === undefined ? null : value);

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { user_id } = req.query;
    let sql = `SELECT n.*, u.email FROM notifications n LEFT JOIN users u ON n.user_id = u.id WHERE 1 = 1`;
    const params = [];

    if (req.user.roles.includes('admin') && user_id) {
      sql += ' AND n.user_id = ?';
      params.push(user_id);
    } else if (!req.user.roles.includes('admin')) {
      sql += ' AND n.user_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY n.created_at DESC LIMIT 200';
    const notifications = await query(sql, params);
    res.json({ success: true, data: { notifications } });
  } catch (error) {
    logger.error('Erreur listage notifications:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des notifications' });
  }
});

router.post('/', verifyJWT, loadRBACContext, requireRole('admin', 'instructor'), async (req, res) => {
  const connection = await getConnection();
  try {
    const { user_id, type, titre, message, data } = req.body;
    if (!user_id || !type || !titre || !message) {
      return res.status(400).json({ success: false, message: 'user_id, type, titre et message requis' });
    }

    const [result] = await connection.execute(
      `INSERT INTO notifications (user_id, type, titre, message, data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [user_id, type, titre, message, data ? JSON.stringify(data) : null]
    );

    await logAudit(req.user.id, 'CREATE_NOTIFICATION', 'notification', 'notifications', result.insertId, req.ip, req.headers['user-agent']);

    res.status(201).json({ success: true, message: 'Notification créée', data: { notificationId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création notification:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la notification' });
  } finally {
    connection.release();
  }
});

router.put('/:id/read', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const notification = await queryOne('SELECT id, user_id FROM notifications WHERE id = ?', [req.params.id]);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }

    if (notification.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('UPDATE notifications SET lu_at = NOW(), updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification marquée comme lue' });
  } catch (error) {
    logger.error('Erreur lecture notification:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la notification' });
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const notification = await queryOne('SELECT id, user_id FROM notifications WHERE id = ?', [req.params.id]);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }

    if (notification.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_NOTIFICATION', 'notification', 'notifications', req.params.id, req.ip, req.headers['user-agent']);

    res.json({ success: true, message: 'Notification supprimée' });
  } catch (error) {
    logger.error('Erreur suppression notification:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la notification' });
  }
});

module.exports = router;
