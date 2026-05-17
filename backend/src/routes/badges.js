const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, pool } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const badges = await query('SELECT * FROM badges ORDER BY created_at DESC');
    res.json({ success: true, data: { badges } });
  } catch (error) {
    logger.error('Erreur listage badges:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des badges' });
  }
});

router.get('/mine', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const badges = await query(
      `SELECT b.*, ub.obtenu_at
       FROM user_badges ub
       INNER JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = ?
       ORDER BY ub.obtenu_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: { badges } });
  } catch (error) {
    logger.error('Erreur listage badges utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement de vos badges' });
  }
});

router.post('/', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { nom, description, icone, critere, xp_valeur } = req.body;
    if (!nom) {
      return res.status(400).json({ success: false, message: 'nom requis' });
    }

    const [result] = await connection.execute(
      `INSERT INTO badges (nom, description, icone, critere, xp_valeur, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [nom, description || null, icone || null, critere || null, xp_valeur || 0]
    );

    await logAudit(req.user.id, 'CREATE_BADGE', 'gamification', 'badges', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Badge créé', data: { badgeId: result.insertId } });
  } catch (error) {
    logger.error('Erreur création badge:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du badge' });
  } finally {
    connection.release();
  }
});

router.post('/award', verifyJWT, loadRBACContext, requireRole('admin', 'instructor'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { user_id, badge_id } = req.body;
    if (!user_id || !badge_id) {
      return res.status(400).json({ success: false, message: 'user_id et badge_id requis' });
    }

    const exists = await queryOne('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?', [user_id, badge_id]);
    if (exists) {
      return res.status(200).json({ success: true, message: 'Badge déjà attribué', data: { userBadgeId: exists.id } });
    }

    const [result] = await connection.execute(
      `INSERT INTO user_badges (user_id, badge_id, obtenu_at)
       VALUES (?, ?, NOW())`,
      [user_id, badge_id]
    );

    await logAudit(req.user.id, 'AWARD_BADGE', 'gamification', 'user_badges', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Badge attribué', data: { userBadgeId: result.insertId } });
  } catch (error) {
    logger.error('Erreur attribution badge:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l attribution du badge' });
  } finally {
    connection.release();
  }
});

module.exports = router;
