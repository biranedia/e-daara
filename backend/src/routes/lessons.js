const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext } = require('../middlewares/rbac');

const router = express.Router();

/**
 * @swagger
 * /lessons:
 *   get:
 *     tags: [Leçons]
 *     summary: Lister les leçons
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  res.json({
    success: true,
    message: 'Routes leçons - À implémenter'
  });
});

module.exports = router;
