const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const settings = await query('SELECT * FROM settings ORDER BY groupe ASC, cle ASC');
    res.json({ success: true, data: { settings } });
  } catch (error) {
    logger.error('Erreur listage settings:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des paramètres' });
  }
});

router.put('/:cle', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const { valeur, groupe, description } = req.body;
    const existing = await queryOne('SELECT id FROM settings WHERE cle = ?', [req.params.cle]);

    if (existing) {
      await query(
        'UPDATE settings SET valeur = ?, groupe = ?, description = ?, updated_at = NOW() WHERE cle = ?',
        [valeur || null, groupe || 'general', description || null, req.params.cle]
      );
    } else {
      await query(
        'INSERT INTO settings (cle, valeur, groupe, description, updated_at) VALUES (?, ?, ?, ?, NOW())',
        [req.params.cle, valeur || null, groupe || 'general', description || null]
      );
    }

    await logAudit(req.user.id, 'UPSERT_SETTING', 'admin', 'settings', null, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Paramètre enregistré' });
  } catch (error) {
    logger.error('Erreur mise à jour setting:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l enregistrement du paramètre' });
  }
});

module.exports = router;
