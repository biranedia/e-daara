/**
 * Script de réinitialisation du mot de passe admin.
 * Usage : node reset-admin-password.js
 */
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const newPassword = 'B@ye1900';
  const hash = await bcrypt.hash(newPassword, 12);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'edaara_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  const [result] = await conn.execute(
    "UPDATE users SET password = ? WHERE email = 'admin@edaara.sn'",
    [hash]
  );

  await conn.end();

  if (result.affectedRows > 0) {
    console.log('✅ Mot de passe mis à jour avec succès !');
    console.log('   Email    : admin@edaara.sn');
    console.log('   Password : B@ye1900');
  } else {
    console.log('❌ Utilisateur admin@edaara.sn introuvable en base.');
  }
}

main().catch(console.error);
