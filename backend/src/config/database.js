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
  charset: 'utf8mb4',
  timezone: '+00:00'
});

// Vérifier la connexion et appliquer les migrations légères au démarrage
pool.getConnection()
  .then(async (conn) => {
    logger.info('✓ Connexion MySQL réussie');

    // Migration : ajouter les colonnes manquantes à lessons si elles n'existent pas
    const db = process.env.DB_NAME;
    const checkCol = async (table, col) => {
      const [rows] = await conn.execute(
        `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [db, table, col]
      );
      return rows[0].cnt > 0;
    };

    if (!(await checkCol('lessons', 'type'))) {
      await conn.execute(
        `ALTER TABLE lessons ADD COLUMN type ENUM('video','pdf','texte','lien','projet') DEFAULT 'texte' AFTER status`
      );
      logger.info('Migration : colonne lessons.type ajoutée');
    }
    if (!(await checkCol('lessons', 'url'))) {
      await conn.execute(
        `ALTER TABLE lessons ADD COLUMN url VARCHAR(1000) NULL AFTER contenu`
      );
      logger.info('Migration : colonne lessons.url ajoutée');
    }
    if (!(await checkCol('lessons', 'deleted_at'))) {
      await conn.execute(
        `ALTER TABLE lessons ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL`
      );
      logger.info('Migration : colonne lessons.deleted_at ajoutée');
    }
    // Migration : ajouter la colonne deleted_at à sections si elle n'existe pas
    if (!(await checkCol('sections', 'deleted_at'))) {
      await conn.execute(
        `ALTER TABLE sections ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL`
      );
      logger.info('Migration : colonne sections.deleted_at ajoutée');
    }
    // Migration : rendre course_validations.admin_id nullable (autoriser NULL pour validations automatiques)
    try {
      const [nullableRows] = await conn.execute(
        `SELECT IS_NULLABLE FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'course_validations' AND COLUMN_NAME = 'admin_id'`,
        [db]
      );
      if (nullableRows.length > 0 && nullableRows[0].IS_NULLABLE !== 'YES') {
        await conn.execute(`ALTER TABLE course_validations MODIFY COLUMN admin_id BIGINT UNSIGNED NULL`);
        logger.info('Migration : course_validations.admin_id rendu nullable');
      }
    } catch (err) {
      // Ne pas planter si la migration échoue — logguer et continuer
      logger.warn('Migration skipped: unable to alter course_validations.admin_id', err.message);
    }
    if (!(await checkCol('lessons', 'thumbnail'))) {
      await conn.execute(
        `ALTER TABLE lessons ADD COLUMN thumbnail VARCHAR(1000) NULL AFTER url`
      );
      logger.info('Migration : colonne lessons.thumbnail ajoutée');
    }
    // Migration : ajouter contenu aux resources pour stocker texte riche
    if (!(await checkCol('resources', 'contenu'))) {
      try {
        await conn.execute(`ALTER TABLE resources ADD COLUMN contenu LONGTEXT NULL AFTER url`);
        logger.info('Migration : colonne resources.contenu ajoutée');
      } catch (err) {
        logger.warn('Migration skipped: unable to add resources.contenu', err.message);
      }
    }
    // Migration : étendre l'enum resources.type pour inclure 'texte' et 'projet'
    try {
      await conn.execute(
        `ALTER TABLE resources MODIFY COLUMN type ENUM('video','pdf','lien','mini_projet','audio','image','texte','projet') NOT NULL`
      );
      logger.info("Migration : resources.type enum étendu (texte, projet) si nécessaire");
    } catch (err) {
      logger.warn('Migration skipped: unable to modify resources.type enum', err.message);
    }

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
