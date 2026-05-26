/**
 * Middlewares d'authentification JWT et OAuth 2.0
 * - Vérification JWT
 * - Extraction utilisateur depuis token
 * - Gestion OAuth Google/Facebook
 */

const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware: Vérifier et décoder le token JWT
 * Attache les données utilisateur à req.user
 */
const verifyJWT = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token JWT manquant ou invalide',
        code: 'MISSING_JWT_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur en BD pour valider son statut + ses rôles en une seule requête
    const user = await queryOne(
      `SELECT u.id, u.email, u.nom, u.prenom, u.status,
              GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ',') AS roles_str
       FROM users u
       LEFT JOIN user_role ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       WHERE u.id = ? AND u.deleted_at IS NULL
       GROUP BY u.id`,
      [decoded.userId]
    );

    if (!user) {
      logger.warn(`JWT valide mais utilisateur non trouvé: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.status !== 'active') {
      logger.warn(`Tentative accès avec compte inactif: ${user.email}`);
      return res.status(403).json({
        success: false,
        message: `Votre compte est ${user.status}`,
        code: 'ACCOUNT_NOT_ACTIVE'
      });
    }

    // Attacher les données utilisateur à la requête (rôles toujours disponibles)
    req.user = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      roles: user.roles_str ? user.roles_str.split(',') : []
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token JWT expiré');
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Token JWT invalide:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
        code: 'INVALID_TOKEN'
      });
    }
    logger.error('Erreur vérification JWT:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Middleware: Optionnel JWT (ne rejette pas si absent)
 * Utile pour les routes publiques avec contenu optionnel authentifié
 */
const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await queryOne(
      'SELECT id, email, nom, prenom, status FROM users WHERE id = ? AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (user && user.status === 'active') {
      req.user = {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom
      };
    }
  } catch (error) {
    logger.debug('Token optionnel invalide ou expiré (autorisé)');
  }

  next();
};

/**
 * Générer un access token JWT
 * @param {number} userId - ID utilisateur
 * @returns {string} Token JWT
 */
const generateAccessToken = (userId) => {
  const payload = {
    userId,
    type: 'access',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION) }
  );
};

/**
 * Générer un refresh token JWT
 * @param {number} userId - ID utilisateur
 * @returns {string} Token JWT refresh
 */
const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION) }
  );
};

/**
 * Vérifier le refresh token et générer un nouveau access token.
 * Vérifie : signature JWT, type, existence + non-révocation en BD, statut user.
 * @param {string} refreshToken - Token à vérifier
 * @returns {Promise<string>} Nouvel access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      throw new Error('Token n\'est pas un refresh token');
    }

    // Vérifier que le token existe en BD et n'a pas été révoqué (logout)
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await queryOne(
      `SELECT id FROM refresh_tokens
       WHERE user_id = ? AND token_hash = ? AND revoked = FALSE AND expires_at > NOW()`,
      [decoded.userId, tokenHash]
    );

    if (!storedToken) {
      throw new Error('Refresh token révoqué ou inexistant en base de données');
    }

    // Vérifier que l'utilisateur existe et est actif
    const user = await queryOne(
      'SELECT id, status FROM users WHERE id = ? AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (!user || user.status !== 'active') {
      throw new Error('Utilisateur non valide');
    }

    return generateAccessToken(decoded.userId);
  } catch (error) {
    logger.error('Erreur refresh token:', error.message);
    throw error;
  }
};

module.exports = {
  verifyJWT,
  optionalJWT,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken
};
