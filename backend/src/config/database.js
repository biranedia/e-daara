/**
 * Configuration de la base de données MySQL
 * Connexion pool MySQL2 avec support async/await
 */

const mysql = require('mysql2/promise');
require('dotenv').config();
const logger = require('../utils/logger');

// Configuration du pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
  timezone: '+00:00'
});

// Vérifier la connexion au démarrage
pool.getConnection()
  .then((conn) => {
    logger.info('✓ Connexion MySQL réussie');
    conn.release();
  })
  .catch((err) => {
    logger.error('✗ Erreur connexion MySQL:', err.message);
    process.exit(1);
  });

/**
 * Exécuter une requête avec résultats
 * @param {string} sql - Requête SQL
 * @param {array} params - Paramètres liés
 * @returns {Promise} Résultats de la requête
 */
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    logger.error('Erreur requête SQL:', error);
    throw error;
  }
};

/**
 * Exécuter une requête avec résultats et métadonnées
 * @param {string} sql - Requête SQL
 * @param {array} params - Paramètres liés
 * @returns {Promise} {rows, fields}
 */
const queryWithMetadata = async (sql, params = []) => {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return { rows, fields };
  } catch (error) {
    logger.error('Erreur requête SQL avec métadonnées:', error);
    throw error;
  }
};

/**
 * Exécuter une seule requête et retourner la première ligne
 * @param {string} sql - Requête SQL
 * @param {array} params - Paramètres liés
 * @returns {Promise} Première ligne ou null
 */
const queryOne = async (sql, params = []) => {
  const results = await query(sql, params);
  return results.length > 0 ? results[0] : null;
};

/**
 * Obtenir une connexion pour les transactions
 * @returns {Promise} Objet connexion
 */
const getConnection = async () => {
  return pool.getConnection();
};

/**
 * Fermer le pool de connexions
 * @returns {Promise}
 */
const closePool = async () => {
  return pool.end();
};

module.exports = {
  pool,
  query,
  queryWithMetadata,
  queryOne,
  getConnection,
  closePool
};
