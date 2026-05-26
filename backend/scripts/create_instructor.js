require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME || 'edaara_db';
const DB_USER_DB = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

// Override via env or use defaults
const EMAIL    = process.env.INSTRUCTOR_EMAIL    || 'formateur@edaara.sn';
const PASSWORD = process.env.INSTRUCTOR_PASSWORD || 'FormPass123!';
const NOM      = process.env.INSTRUCTOR_NOM      || 'Formateur';
const PRENOM   = process.env.INSTRUCTOR_PRENOM   || 'E-DAARA';

async function main() {
  console.log(`Connecting to ${DB_USER_DB}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  const conn = await mysql.createConnection({
    host: DB_HOST, port: DB_PORT,
    user: DB_USER_DB, password: DB_PASSWORD, database: DB_NAME
  });

  try {
    // Ensure instructor role exists
    const [roles] = await conn.execute('SELECT id FROM roles WHERE name = ?', ['instructor']);
    let roleId;
    if (roles.length > 0) {
      roleId = roles[0].id;
      console.log('Found instructor role id =', roleId);
    } else {
      const [r] = await conn.execute(
        'INSERT INTO roles (name, description, created_at) VALUES (?, ?, NOW())',
        ['instructor', 'Instructor / Formateur role']
      );
      roleId = r.insertId;
      console.log('Created instructor role id =', roleId);
    }

    // Create or update user
    const hashed = await bcrypt.hash(PASSWORD, 12);
    const [existing] = await conn.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [EMAIL]);
    let userId;
    if (existing.length > 0) {
      userId = existing[0].id;
      await conn.execute(
        'UPDATE users SET password = ?, status = ?, nom = ?, prenom = ?, updated_at = NOW() WHERE id = ?',
        [hashed, 'active', NOM, PRENOM, userId]
      );
      console.log('Updated existing user id =', userId);
    } else {
      const [ins] = await conn.execute(
        'INSERT INTO users (nom, prenom, email, password, provider, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [NOM, PRENOM, EMAIL, hashed, 'local', 'active']
      );
      userId = ins.insertId;
      console.log('Created new user id =', userId);
    }

    // Assign instructor role (keep existing roles)
    const [ur] = await conn.execute(
      'SELECT 1 FROM user_role WHERE user_id = ? AND role_id = ? LIMIT 1',
      [userId, roleId]
    );
    if (ur.length === 0) {
      await conn.execute('INSERT INTO user_role (user_id, role_id) VALUES (?, ?)', [userId, roleId]);
      console.log('Assigned instructor role');
    } else {
      console.log('User already has instructor role');
    }

    console.log(`\nFormateur prêt :`);
    console.log(`  Email    : ${EMAIL}`);
    console.log(`  Password : ${PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Erreur :', err.message || err);
    process.exit(2);
  } finally {
    try { await conn.end(); } catch (e) {}
  }
}

main();
