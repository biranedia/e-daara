/**
 * Routes d'authentification
 * POST /api/auth/register - Inscription
 * POST /api/auth/login - Connexion
 * POST /api/auth/refresh-token - Renouveler token
 * POST /api/auth/logout - Déconnexion
 * POST /api/auth/forgot-password - Demande réinitialisation
 * POST /api/auth/reset-password - Réinitialiser mot de passe
 */

const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentification]
 *     summary: Inscription d'un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Diao"
 *               prenom:
 *                 type: string
 *                 example: "Birane"
 *               email:
 *                 type: string
 *                 example: "birane@edaara.sn"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePassword123!"
 *     responses:
 *       201:
 *         description: Inscription réussie
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email déjà enregistré
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentification]
 *     summary: Connexion utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "birane@edaara.sn"
 *               password:
 *                 type: string
 *                 example: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Connexion réussie avec tokens JWT
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Authentification]
 *     summary: Renouveler l'access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nouvel access token généré
 *       401:
 *         description: Refresh token invalide ou expiré
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentification]
 *     summary: Déconnexion utilisateur
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout', verifyJWT, authController.logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Authentification]
 *     summary: Demande de réinitialisation de mot de passe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "birane@edaara.sn"
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé (ou message générique par sécurité)
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Authentification]
 *     summary: Réinitialiser le mot de passe avec token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       401:
 *         description: Token invalide ou expiré
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;
