/**
 * Middleware RBAC (Role-Based Access Control)
 * Contrôle granulaire des accès par rôle et permissions
 * Rôles: admin, instructor, student, visitor
 */

const { query, queryOne } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Charger les rôles et permissions d'un utilisateur
 * @param {number} userId - ID utilisateur
 * @returns {Promise} {roles: [], permissions: []}
 */
const loadUserRolesAndPermissions = async (userId) => {
  try {
    // Récupérer les rôles
    const roles = await query(
      `SELECT r.id, r.name 
       FROM roles r
       INNER JOIN user_role ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );

    // Récupérer les permissions associées
    const permissions = await query(
      `SELECT DISTINCT p.name, p.module
       FROM permissions p
       INNER JOIN role_permission rp ON p.id = rp.permission_id
       INNER JOIN user_role ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );

    return {
      roles: roles.map(r => r.name),
      permissions: permissions.map(p => p.name)
    };
  } catch (error) {
    logger.error('Erreur chargement rôles/permissions:', error);
    return { roles: [], permissions: [] };
  }
};

/**
 * Middleware: Charger rôles et permissions de l'utilisateur
 * Nécessite verifyJWT avant
 */
const loadRBACContext = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    const rbac = await loadUserRolesAndPermissions(req.user.id);
    req.user.roles = rbac.roles;
    req.user.permissions = rbac.permissions;
    next();
  } catch (error) {
    logger.error('Erreur chargement contexte RBAC:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Factory: Vérifier si l'utilisateur a un rôle spécifique
 * @param {...string} allowedRoles - Rôles autorisés
 * @returns {function} Middleware Express
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'UNAUTHORIZED'
      });
    }

    const hasRole = allowedRoles.some(role => req.user.roles.includes(role));
    if (!hasRole) {
      logger.warn(
        `Accès refusé - Rôle insuffisant pour ${req.user.email}. Rôles: ${req.user.roles.join(', ')}`
      );
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - rôle insuffisant',
        code: 'FORBIDDEN_ROLE'
      });
    }

    next();
  };
};

/**
 * Factory: Vérifier si l'utilisateur a une permission spécifique
 * @param {...string} allowedPermissions - Permissions autorisées
 * @returns {function} Middleware Express
 */
const requirePermission = (...allowedPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'UNAUTHORIZED'
      });
    }

    const hasPermission = allowedPermissions.some(perm =>
      req.user.permissions.includes(perm)
    );

    if (!hasPermission) {
      logger.warn(
        `Permission refusée pour ${req.user.email}. Permissions: ${req.user.permissions.join(', ')}`
      );
      return res.status(403).json({
        success: false,
        message: 'Permission refusée',
        code: 'FORBIDDEN_PERMISSION'
      });
    }

    next();
  };
};

/**
 * Enregistrer une action d'audit (log)
 * Traçabilité complète: qui fait quoi, quand, depuis où
 * @param {number} userId - ID utilisateur
 * @param {string} action - Description de l'action
 * @param {string} resource - Ressource affectée (ex: courses, users)
 * @param {*} resourceId - ID de la ressource
 * @param {string} ipAddress - Adresse IP
 * @param {string} userAgent - User agent du client
 * @returns {Promise}
 */
const logAudit = async (userId, action, resource, resourceId, ipAddress, userAgent) => {
  try {
    await query(
      `INSERT INTO audit_logs 
       (user_id, action, resource, resource_id, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, action, resource, resourceId, ipAddress, userAgent]
    );
  } catch (error) {
    logger.error('Erreur enregistrement audit log:', error);
  }
};

/**
 * Middleware: Enregistrer automatiquement les actions dans les logs d'audit
 */
const auditLogger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // N'enregistrer que les actions modifiant les données (POST, PUT, DELETE)
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.user) {
      const ipAddress = req.ip ||
        req.connection.remoteAddress ||
        req.headers['x-forwarded-for'];

      setImmediate(() => {
        logAudit(
          req.user.id,
          `${req.method} ${req.path}`,
          req.path.split('/')[2], // Extraire la ressource (ex: 'courses' de '/api/courses')
          req.params.id || null,
          ipAddress,
          req.headers['user-agent']
        ).catch(err => logger.error('Audit log failed:', err));
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

module.exports = {
  loadUserRolesAndPermissions,
  loadRBACContext,
  requireRole,
  requirePermission,
  logAudit,
  auditLogger
};
