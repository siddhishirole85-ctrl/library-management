// MySQL connection pool using mysql2/promise.
// We chose `mysql2` (not Sequelize) for transparent SQL, smaller footprint,
// and full control over indexes/transactions used by the business logic.
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  namedPlaceholders: true,
});

module.exports = { pool };
