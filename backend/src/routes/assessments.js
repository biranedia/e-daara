const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext } = require('../middlewares/rbac');

const router = express.Router();

/**
 * @swagger
 * /assessments:
 *   get:
 *     tags: [Évaluations]
 *     summary: Lister les évaluations
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  res.json({
    success: true,
    message: 'Routes évaluations - À implémenter'
  });
});

module.exports = router;
