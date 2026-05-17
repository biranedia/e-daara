const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext } = require('../middlewares/rbac');

const router = express.Router();

/**
 * @swagger
 * /enrollments:
 *   get:
 *     tags: [Inscriptions]
 *     summary: Mes inscriptions
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  res.json({
    success: true,
    message: 'Routes inscriptions - À implémenter'
  });
});

/**
 * @swagger
 * /enrollments:
 *   post:
 *     tags: [Inscriptions]
 *     summary: S'inscrire à un cours
 *     security:
 *       - BearerAuth: []
 */
router.post('/', verifyJWT, loadRBACContext, async (req, res) => {
  res.json({
    success: true,
    message: 'Routes inscriptions - À implémenter'
  });
});

module.exports = router;
