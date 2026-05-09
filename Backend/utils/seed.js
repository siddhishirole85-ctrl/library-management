// Seeds the database. Generates a fresh bcrypt hash for "Password123!"
// so seeded accounts can actually log in.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  let sql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'seed.sql'), 'utf8');
  const hash = await bcrypt.hash('Password123!', 10);
  sql = sql.replace(/\$2a\$10\$[^']+/g, hash);

  await conn.query(sql);
  console.log('✅ Seed data inserted (login password: Password123!)');
  await conn.end();
})().catch(e => { console.error(e); process.exit(1); });
