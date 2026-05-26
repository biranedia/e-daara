const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext } = require('../middlewares/rbac');
const { query, queryOne } = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /dashboard/student:
 *   get:
 *     tags: [Dashboard]
 *     summary: Tableau de bord apprenant
 *     security:
 *       - BearerAuth: []
 */
router.get('/student', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const stats = await queryOne(
      `SELECT 
        (SELECT COUNT(*) FROM enrollments WHERE user_id = ?) as enrolled_courses,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND status = 'completed') as completed_courses,
        (SELECT COUNT(*) FROM path_enrollments WHERE user_id = ?) as enrolled_paths,
        (SELECT SUM(progression) / COUNT(*) FROM enrollments WHERE user_id = ?) as avg_progression
       FROM dual`,
      [req.user.id, req.user.id, req.user.id, req.user.id]
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur'
    });
  }
});

module.exports = router;
