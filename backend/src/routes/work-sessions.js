const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const sessions = await query(
      `SELECT ws.*, c.titre AS course_titre, l.titre AS lesson_titre
       FROM work_sessions ws
       LEFT JOIN courses c ON ws.course_id = c.id
       LEFT JOIN lessons l ON ws.lesson_id = l.id
       WHERE ws.user_id = ?
       ORDER BY ws.debut DESC
       LIMIT 200`,
      [req.user.id]
    );
    res.json({ success: true, data: { sessions } });
  } catch (error) {
    logger.error('Erreur listage sessions:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des sessions' });
  }
});

router.post('/', verifyJWT, loadRBACContext, async (req, res) => {
  const connection = await getConnection();
  try {
    const { course_id, lesson_id, ip_address } = req.body;
    const [result] = await connection.execute(
      `INSERT INTO work_sessions (user_id, course_id, lesson_id, debut, duree_min, ip_address, created_at)
       VALUES (?, ?, ?, NOW(), 0, ?, NOW())`,
      [req.user.id, course_id || null, lesson_id || null, ip_address || req.ip]
    );

    await logAudit(req.user.id, 'START_WORK_SESSION', 'progression', 'work_sessions', result.insertId, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, message: 'Session démarrée', data: { sessionId: result.insertId } });
  } catch (error) {
    logger.error('Erreur démarrage session:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du démarrage de la session' });
  } finally {
    connection.release();
  }
});

router.put('/:id/stop', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const session = await queryOne('SELECT id, user_id, debut FROM work_sessions WHERE id = ?', [req.params.id]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }
    if (session.user_id !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    await query(
      `UPDATE work_sessions
       SET fin = NOW(),
           duree_min = TIMESTAMPDIFF(MINUTE, debut, NOW())
       WHERE id = ?`,
      [req.params.id]
    );

    await logAudit(req.user.id, 'STOP_WORK_SESSION', 'progression', 'work_sessions', req.params.id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Session arrêtée' });
  } catch (error) {
    logger.error('Erreur arrêt session:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l arrêt de la session' });
  }
});

module.exports = router;
