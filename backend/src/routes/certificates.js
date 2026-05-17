const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, pool } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

const generateSerial = () => `CER-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const { user_id } = req.query;
    let sql = `
      SELECT c.*, u.email, co.titre AS course_titre, p.titre AS path_titre
      FROM certificates c
      INNER JOIN users u ON c.user_id = u.id
      LEFT JOIN courses co ON c.course_id = co.id
      LEFT JOIN paths p ON c.path_id = p.id
      WHERE 1 = 1
    `;
    const params = [];

    if (req.user.roles.includes('admin') && user_id) {
      sql += ' AND c.user_id = ?';
      params.push(user_id);
    } else if (!req.user.roles.includes('admin')) {
      sql += ' AND c.user_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY c.emis_at DESC LIMIT 200';
    const certificates = await query(sql, params);
    res.json({ success: true, data: { certificates } });
  } catch (error) {
    logger.error('Erreur listage certificats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des certificats' });
  }
});

router.get('/verify/:numero_serie', async (req, res) => {
  try {
    const certificate = await queryOne(
      `SELECT c.*, u.nom, u.prenom, u.email, co.titre AS course_titre, p.titre AS path_titre
       FROM certificates c
       INNER JOIN users u ON c.user_id = u.id
       LEFT JOIN courses co ON c.course_id = co.id
       LEFT JOIN paths p ON c.path_id = p.id
       WHERE c.numero_serie = ?`,
      [req.params.numero_serie]
    );

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificat non trouvé' });
    }

    res.json({ success: true, data: { certificate } });
  } catch (error) {
    logger.error('Erreur vérification certificat:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification du certificat' });
  }
});

router.post('/issue', verifyJWT, loadRBACContext, requireRole('admin', 'instructor'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { user_id, course_id, path_id, numero_serie, url_pdf } = req.body;
    if (!user_id || (!course_id && !path_id)) {
      return res.status(400).json({ success: false, message: 'user_id et course_id ou path_id requis' });
    }

    const serial = numero_serie || generateSerial();
    const existing = await queryOne('SELECT id FROM certificates WHERE numero_serie = ?', [serial]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Numero de serie déjà utilisé' });
    }

    const [result] = await connection.execute(
      `INSERT INTO certificates (user_id, course_id, path_id, numero_serie, url_pdf, emis_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [user_id, course_id || null, path_id || null, serial, url_pdf || null]
    );

    await logAudit(req.user.id, 'ISSUE_CERTIFICATE', 'achievement', 'certificates', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Certificat émis', data: { certificateId: result.insertId, numero_serie: serial } });
  } catch (error) {
    logger.error('Erreur émission certificat:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l émission du certificat' });
  } finally {
    connection.release();
  }
});

module.exports = router;
