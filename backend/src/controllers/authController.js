/**
 * Contrôleur d'authentification
 * Gestion JWT, OAuth, et refresh tokens
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query, queryOne, getConnection } = require('../config/database');
const {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken
} = require('../middlewares/auth');
const logger = require('../utils/logger');

/**
 * POST /auth/register
 * Inscription d'un nouvel utilisateur local
 */
const register = async (req, res) => {
  const conn = await getConnection();

  try {
    const { nom, prenom, email, password, acceptTerms } = req.body;

    // Validation basique
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis: nom, prenom, email, password',
        code: 'VALIDATION_ERROR'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères',
        code: 'WEAK_PASSWORD'
      });
    }

    // Vérifier email unique
    const existing = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email déjà enregistré',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    await conn.beginTransaction();

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const [insertResult] = await conn.execute(
      `INSERT INTO users (nom, prenom, email, password, provider, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'local', 'active', NOW(), NOW())`,
      [nom, prenom, email, hashedPassword]
    );

    const userId = insertResult.insertId;

    // Assigner le rôle par défaut (student)
    const studentRole = await queryOne('SELECT id FROM roles WHERE name = "student"');
    if (studentRole) {
      await conn.execute(
        'INSERT INTO user_role (user_id, role_id) VALUES (?, ?)',
        [userId, studentRole.id]
      );
    }

    // Créer le profil apprenant
    await conn.execute(
      `INSERT INTO learner_profiles (user_id, created_at, updated_at)
       VALUES (?, NOW(), NOW())`,
      [userId]
    );

    await conn.commit();

    // Générer tokens
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Enregistrer le refresh token en BD
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))`,
      [
        userId,
        crypto.createHash('sha256').update(refreshToken).digest('hex'),
        req.ip,
        req.headers['user-agent'],
        process.env.JWT_REFRESH_TOKEN_EXPIRATION
      ]
    );

    logger.info(`Nouvel utilisateur inscrit: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        userId,
        email,
        nom,
        prenom,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION
      }
    });
  } catch (error) {
    await conn.rollback();
    logger.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      code: 'REGISTER_ERROR'
    });
  } finally {
    conn.release();
  }
};

/**
 * POST /auth/login
 * Authentification par email/password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Chercher l'utilisateur
    const user = await queryOne(
      `SELECT id, email, nom, prenom, password, status, provider, provider_id
       FROM users 
       WHERE email = ? AND deleted_at IS NULL`,
      [email]
    );

    if (!user) {
      logger.warn(`Tentative connexion email invalide: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Vérifier le statut
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Votre compte est ${user.status}`,
        code: 'ACCOUNT_NOT_ACTIVE'
      });
    }

    // Vérifier le mot de passe (pour auth locale)
    if (user.provider === 'local') {
      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Ce compte utilise uniquement l\'authentification OAuth',
          code: 'OAUTH_ONLY_ACCOUNT'
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        logger.warn(`Mauvais mot de passe pour: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect',
          code: 'INVALID_CREDENTIALS'
        });
      }
    }

    // Mettre à jour last_login_at
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // Générer tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Enregistrer le refresh token
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))`,
      [
        user.id,
        crypto.createHash('sha256').update(refreshToken).digest('hex'),
        req.ip,
        req.headers['user-agent'],
        process.env.JWT_REFRESH_TOKEN_EXPIRATION
      ]
    );

    logger.info(`Utilisateur connecté: ${email}`);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        userId: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      code: 'LOGIN_ERROR'
    });
  }
};

/**
 * POST /auth/refresh-token
 * Générer un nouveau access token à partir du refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    try {
      const newAccessToken = await refreshAccessToken(token);
      res.json({
        success: true,
        message: 'Token renouvelé',
        data: {
          accessToken: newAccessToken,
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION
        }
      });
    } catch (error) {
      logger.warn('Refresh token invalide ou expiré');
      res.status(401).json({
        success: false,
        message: 'Refresh token invalide ou expiré',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
  } catch (error) {
    logger.error('Erreur refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * POST /auth/logout
 * Déconnexion - révoquer le refresh token
 */
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (token && req.user) {
      // Révoquer le refresh token en BD
      await query(
        `UPDATE refresh_tokens 
         SET revoked = TRUE 
         WHERE user_id = ? AND token_hash = ?`,
        [req.user.id, crypto.createHash('sha256').update(token).digest('hex')]
      );
    }

    logger.info(`Utilisateur déconnecté: ${req.user?.email}`);

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    logger.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
      code: 'LOGOUT_ERROR'
    });
  }
};

/**
 * POST /auth/forgot-password
 * Demande de réinitialisation de mot de passe
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis',
        code: 'MISSING_EMAIL'
      });
    }

    const user = await queryOne(
      'SELECT id, email, nom FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );

    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user) {
      return res.json({
        success: true,
        message: 'Si cet email est enregistré, un lien de réinitialisation a été envoyé'
      });
    }

    // Générer token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Enregistrer en BD
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))`,
      [user.id, tokenHash]
    );

    logger.info(`Demande réinitialisation mot de passe: ${email}`);

    // TODO: Envoyer email avec lien de réinitialisation
    // resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    res.json({
      success: true,
      message: 'Si cet email est enregistré, un lien de réinitialisation a été envoyé'
    });
  } catch (error) {
    logger.error('Erreur forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * POST /auth/reset-password
 * Réinitialisation du mot de passe avec token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token et nouveau mot de passe requis',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères',
        code: 'WEAK_PASSWORD'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Vérifier le token
    const reset = await queryOne(
      `SELECT user_id FROM password_resets 
       WHERE token_hash = ? AND expires_at > NOW() AND used = FALSE`,
      [tokenHash]
    );

    if (!reset) {
      return res.status(401).json({
        success: false,
        message: 'Token de réinitialisation invalide ou expiré',
        code: 'INVALID_RESET_TOKEN'
      });
    }

    // Hasher et mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, reset.user_id]
    );

    // Marquer le token comme utilisé
    await query(
      'UPDATE password_resets SET used = TRUE WHERE token_hash = ?',
      [tokenHash]
    );

    logger.info('Mot de passe réinitialisé pour utilisateur: ' + reset.user_id);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    logger.error('Erreur reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
};
