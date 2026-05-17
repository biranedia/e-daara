const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, pool } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/mine', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const requests = await query('SELECT * FROM gdpr_requests WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, data: { requests } });
  } catch (error) {
    logger.error('Erreur listage demandes GDPR:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de vos demandes' });
  }
});

router.get('/', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const requests = await query(
      `SELECT g.*, u.email AS user_email, a.email AS treated_by_email
       FROM gdpr_requests g
       LEFT JOIN users u ON g.user_id = u.id
       LEFT JOIN users a ON g.traite_par = a.id
       ORDER BY g.created_at DESC`,
    );
    res.json({ success: true, data: { requests } });
  } catch (error) {
    logger.error('Erreur listage demandes GDPR admin:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des demandes' });
  }
});

router.post('/', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { type, detail } = req.body;
    if (!['access', 'delete', 'rectify', 'portability'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type de demande invalide' });
    }

    const [result] = await connection.execute(
      `INSERT INTO gdpr_requests (user_id, type, detail, statut, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
      [req.user.id, type, detail || null]
    );

    await logAudit(req.user.id, 'CREATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Demande créée', data: { requestId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création demande GDPR:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la demande' });
  } finally {
    connection.release();
  }
});

router.put('/:id/status', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const { statut, detail } = req.body;
    if (!['pending', 'processing', 'completed', 'rejected'].includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const request = await queryOne('SELECT id FROM gdpr_requests WHERE id = ?', [req.params.id]);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée' });
    }

    await query(
      `UPDATE gdpr_requests SET statut = ?, detail = ?, traite_par = ?, traite_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [statut, detail || null, req.user.id, req.params.id]
    );

    await logAudit(req.user.id, 'UPDATE_GDPR_REQUEST', 'gdpr', 'gdpr_requests', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Demande mise à jour' });
  } catch (error) {
    logger.error('Erreur mise à jour demande GDPR:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la demande' });
  }
});

module.exports = router;
