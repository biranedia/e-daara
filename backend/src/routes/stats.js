const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole, logAudit } = require('../middlewares/rbac');
const { query, queryOne, getConnection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/latest', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const snapshot = await queryOne('SELECT * FROM stats_snapshots ORDER BY snap_date DESC LIMIT 1');
    res.json({ success: true, data: { snapshot } });
  } catch (error) {
    logger.error('Erreur lecture stats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement des statistiques' });
  }
});

router.post('/refresh', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  const connection = await getConnection();
  try {
    const [users] = await connection.execute('SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL');
    const [courses] = await connection.execute('SELECT COUNT(*) AS total FROM courses WHERE deleted_at IS NULL');
    const [enrollments] = await connection.execute('SELECT COUNT(*) AS total FROM enrollments');
    const [completions] = await connection.execute("SELECT COUNT(*) AS total FROM enrollments WHERE status = 'completed'");
    const [quizzes] = await connection.execute('SELECT COUNT(*) AS total FROM quiz_results');

    await connection.execute(
      `INSERT INTO stats_snapshots
       (snap_date, total_users, total_apprenants, total_formateurs, total_cours, total_inscriptions, total_completions, total_quizzes, created_at)
       VALUES (CURDATE(), ?, 0, 0, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE total_users = VALUES(total_users), total_cours = VALUES(total_cours), total_inscriptions = VALUES(total_inscriptions), total_completions = VALUES(total_completions), total_quizzes = VALUES(total_quizzes), created_at = NOW()`,
      [users[0].total, courses[0].total, enrollments[0].total, completions[0].total, quizzes[0].total]
    );

    await logAudit(req.user.id, 'REFRESH_STATS_SNAPSHOT', 'admin', 'stats_snapshots', null, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Statistiques recalculées' });
  } catch (error) {
    logger.error('Erreur refresh stats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du recalcul des statistiques' });
  } finally {
    connection.release();
  }
});

router.get('/history', verifyJWT, loadRBACContext, requireRole('admin'), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 90);
    const snapshots = await query(
      'SELECT * FROM stats_snapshots ORDER BY snap_date DESC LIMIT ?',
      [limit]
    );
    res.json({ success: true, data: { snapshots: snapshots.reverse() } });
  } catch (error) {
    logger.error('Erreur historique stats:', error);
    res.status(500).json({ success: false, message: 'Erreur' });
  }
});

module.exports = router;
