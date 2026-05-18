const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const box = (req.query.box || 'inbox').toLowerCase();
    let sql = `
      SELECT m.*, s.email AS sender_email, r.email AS receiver_email
      FROM messages m
      LEFT JOIN users s ON m.expediteur_id = s.id
      LEFT JOIN users r ON m.destinataire_id = r.id
      WHERE 1 = 1
    `;
    const params = [];

    if (box === 'sent') {
      sql += ' AND m.expediteur_id = ?';
      params.push(req.user.id);
    } else if (box === 'all' && req.user.roles.includes('admin')) {
      // no extra filter
    } else {
      sql += ' AND m.destinataire_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY m.created_at DESC LIMIT 200';
    const messages = await query(sql, params);
    res.json({ success: true, data: { messages } });
  } catch (error) {
    logger.error('Erreur listage messages:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des messages' });
  }
});

router.post('/', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await getConnection();
  try {
    const { destinataire_id, sujet, corps, course_id } = req.body;
    if (!destinataire_id || !corps) {
      return res.status(400).json({ success: false, message: 'destinataire_id et corps requis' });
    }

    const recipient = await queryOne('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL', [destinataire_id]);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Destinataire non trouvé' });
    }

    const [result] = await connection.execute(
      `INSERT INTO messages (expediteur_id, destinataire_id, course_id, sujet, corps, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [req.user.id, destinataire_id, course_id || null, sujet || null, corps]
    );

    await logAudit(req.user.id, 'SEND_MESSAGE', 'communication', 'messages', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Message envoyé', data: { messageId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création message:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l envoi du message' });
  } finally {
    connection.release();
  }
});

router.put('/:id/read', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const message = await queryOne('SELECT id, destinataire_id FROM messages WHERE id = ?', [req.params.id]);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message non trouvé' });
    }
    if (message.destinataire_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('UPDATE messages SET lu_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Message marqué comme lu' });
  } catch (error) {
    logger.error('Erreur lecture message:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la lecture du message' });
  }
});

router.delete('/:id', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const message = await queryOne('SELECT id, expediteur_id, destinataire_id FROM messages WHERE id = ?', [req.params.id]);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message non trouvé' });
    }
    if (message.expediteur_id !== req.user.id && message.destinataire_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    await logAudit(req.user.id, 'DELETE_MESSAGE', 'communication', 'messages', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Message supprimé' });
  } catch (error) {
    logger.error('Erreur suppression message:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du message' });
  }
});

module.exports = router;
