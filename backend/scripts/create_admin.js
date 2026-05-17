require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME || 'edaara_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@edaara.sn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!';
const ADMIN_NOM = process.env.ADMIN_NOM || 'Admin';
const ADMIN_PRENOM = process.env.ADMIN_PRENOM || 'E-DAARA';

async function main() {
  console.log('Connecting to DB', `${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, database: DB_NAME });

  try {
    // Ensure admin role exists
    const [roles] = await conn.execute('SELECT id FROM roles WHERE name = ?', ['admin']);
    let adminRoleId;
    if (roles.length > 0) {
      adminRoleId = roles[0].id;
      console.log('Found admin role id =', adminRoleId);
    } else {
      const [r] = await conn.execute('INSERT INTO roles (name, description, created_at) VALUES (?, ?, NOW())', ['admin', 'Administrator role']);
      adminRoleId = r.insertId;
      console.log('Created admin role id =', adminRoleId);
    }

    // Check if user exists
    const [users] = await conn.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [ADMIN_EMAIL]);
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    let userId;
    if (users.length > 0) {
      userId = users[0].id;
      await conn.execute('UPDATE users SET password = ?, provider = ?, status = ?, nom = ?, prenom = ?, updated_at = NOW() WHERE id = ?', [hashed, 'local', 'active', ADMIN_NOM, ADMIN_PRENOM, userId]);
      console.log('Updated existing user id =', userId);
    } else {
      const [ins] = await conn.execute(
        'INSERT INTO users (nom, prenom, email, password, provider, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [ADMIN_NOM, ADMIN_PRENOM, ADMIN_EMAIL, hashed, 'local', 'active']
      );
      userId = ins.insertId;
      console.log('Created new user id =', userId);
    }

    // Ensure user_role exists
    const [ur] = await conn.execute('SELECT 1 FROM user_role WHERE user_id = ? AND role_id = ? LIMIT 1', [userId, adminRoleId]);
    if (ur.length === 0) {
      await conn.execute('INSERT INTO user_role (user_id, role_id) VALUES (?, ?)', [userId, adminRoleId]);
      console.log('Assigned admin role to user');
    } else {
      console.log('User already has admin role');
    }

    console.log(`Admin ready: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message || err);
    process.exit(2);
  } finally {
    try { await conn.end(); } catch (e) { }
  }
}

main();
