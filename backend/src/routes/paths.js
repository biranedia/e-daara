/**
 * Routes pour les parcours
 */

const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext, requireRole } = require('../middlewares/rbac');

const router = express.Router();

/**
 * @swagger
 * /paths:
 *   get:
 *     tags: [Parcours]
 *     summary: Lister les parcours
 */
router.get('/', verifyJWT, loadRBACContext, async (req, res) => {
  res.json({
    success: true,
    message: 'Routes parcours - À implémenter',
    data: {}
  });
});

/**
 * @swagger
 * /paths:
 *   post:
 *     tags: [Parcours]
 *     summary: Créer un parcours
 *     security:
 *       - BearerAuth: []
 */
router.post('/', verifyJWT, loadRBACContext, requireRole('instructor', 'admin'), async (req, res) => {
  res.json({
    success: true,
    message: 'Routes parcours - À implémenter',
    data: {}
  });
});

module.exports = router;
