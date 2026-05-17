/**
 * Application Express principale
 * Configuration des middlewares, routes et gestion des erreurs
 */

require('dotenv').config();
require('express-async-errors'); // Gestion automatique des erreurs async

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const logger = require('./utils/logger');
const { auditLogger } = require('./middlewares/rbac');

// Créer l'app Express
const app = express();

// ========================================
// 1. MIDDLEWARES DE SÉCURITÉ
// ========================================

// Helmet - Sécurité HTTP headers
app.use(helmet());

// CORS - Partage de ressources cross-origin
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - Protection contre les abus
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// ========================================
// 2. MIDDLEWARES DE PARSING
// ========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========================================
// 3. LOGGING
// ========================================

// Morgan - Logging des requêtes HTTP
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

// Middleware d'audit personnalisé
app.use(auditLogger);

// ========================================
// 4. SWAGGER / OPENAPI
// ========================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-DAARA API REST',
      version: '1.0.0',
      description: 'Plateforme d\'apprentissage en ligne souveraine pour l\'Afrique',
      contact: {
        name: 'Birane Diao',
        email: 'birane@edaara.sn'
      },
      license: {
        name: 'AGPL-3.0',
        url: 'https://opensource.org/licenses/AGPL-3.0'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Serveur développement',
        variables: {
          protocol: { default: 'http' },
          host: { default: 'localhost' }
        }
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token depuis /auth/login'
        }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redirect /docs vers /api-docs
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// ========================================
// 5. ROUTES
// ========================================

// Route santé (health check)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API version
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'E-DAARA Backend',
    environment: process.env.NODE_ENV
  });
});

// Routes d'authentification
app.use('/api/auth', require('./routes/auth'));

// Routes publiques (catalogue, cours)
app.use('/api/public', require('./routes/public'));

// Routes protégées par JWT
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/paths', require('./routes/paths'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/gdpr', require('./routes/gdpr'));
app.use('/api/media', require('./routes/media'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/work-sessions', require('./routes/work-sessions'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Routes admin
app.use('/api/admin', require('./routes/admin'));

// ========================================
// 6. GESTION DES ERREURS
// ========================================

// 404 - Route non trouvée
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method
  });
});

// Gestionnaire global des erreurs
app.use((error, req, res, next) => {
  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Erreur serveur';

  logger.error(`[${status}] ${message}`, {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: error.stack
  });

  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Erreur serveur'
      : message,
    code: error.code || 'SERVER_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// ========================================
// 7. DÉMARRAGE DU SERVEUR
// ========================================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  logger.info(
    `✓ Serveur E-DAARA démarré sur http://${HOST}:${PORT}`
  );
  logger.info(
    `✓ Documentation Swagger: http://${HOST}:${PORT}/api-docs`
  );
  logger.info(
    `✓ Environnement: ${process.env.NODE_ENV}`
  );
});

// Gestion graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Signal SIGTERM reçu, arrêt du serveur...');
  server.close(() => {
    logger.info('✓ Serveur arrêté');
    process.exit(0);
  });

  // Force close après 10s
  setTimeout(() => {
    logger.error('Force closing server');
    process.exit(1);
  }, 10000);
});

process.on('uncaughtException', (error) => {
  logger.error('Exception non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejetée non capturée:', reason);
});

module.exports = app;
