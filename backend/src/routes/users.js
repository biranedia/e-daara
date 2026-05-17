/**
 * Routes utilisateurs
 * Gestion du profil, préférences, etc.
 */

const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const { loadRBACContext } = require('../middlewares/rbac');
const { query, queryOne } = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Utilisateurs]
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get('/profile', verifyJWT, loadRBACContext, async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT u.id, u.email, u.nom, u.prenom, u.avatar, u.bio,
              u.date_naissance, u.langue_pref, u.status,
              u.created_at, u.last_login_at
       FROM users u
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          roles: req.user.roles
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Utilisateurs]
 *     summary: Mettre à jour le profil
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *               langue_pref:
 *                 type: string
 */
router.put('/profile', verifyJWT, async (req, res) => {
  try {
    const { nom, prenom, bio, avatar, langue_pref } = req.body;

    const updates = [];
    const params = [];

    if (nom !== undefined) {
      updates.push('nom = ?');
      params.push(nom);
    }
    if (prenom !== undefined) {
      updates.push('prenom = ?');
      params.push(prenom);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    if (langue_pref !== undefined) {
      updates.push('langue_pref = ?');
      params.push(langue_pref);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour'
      });
    }

    params.push(req.user.id);

    await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     tags: [Utilisateurs]
 *     summary: Changer le mot de passe
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 */
router.post('/change-password', verifyJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Ancien et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    const user = await queryOne(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Ce compte n\'a pas de mot de passe local'
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement du mot de passe'
    });
  }
});

module.exports = router;
