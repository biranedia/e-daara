/**
 * Système de logging centralisé avec Winston
 * Logs fichier + console avec niveaux (error, warn, info, http, debug)
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Créer le répertoire des logs s'il n'existe pas
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Format personnalisé
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}] ${message} ${metaStr}`;
  })
);

// Niveaux de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'blue',
  debug: 'white'
};

winston.addColors(colors);

// Transports
const transports = [
  // Fichier erreurs
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  // Fichier tous les logs
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    format: customFormat,
    maxsize: 5242880,
    maxFiles: 10
  }),
  // Console (développement)
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      customFormat
    )
  })
];

// Logger instance
const logger = winston.createLogger({
  levels,
  format: customFormat,
  transports,
  defaultMeta: {
    service: 'e-daara-backend'
  }
});

module.exports = logger;
