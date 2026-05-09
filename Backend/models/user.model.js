// Thin data-access layer for users. Uses parameterized queries (SQL-injection safe).
const { pool } = require('../config/db');

const UserModel = {
  async create({ name, email, password_hash, role = 'member', phone = null }) {
    const [r] = await pool.execute(
      `INSERT INTO users (name,email,password_hash,role,phone) VALUES (?,?,?,?,?)`,
      [name, email, password_hash, role, phone]
    );
    return { id: r.insertId, name, email, role };
  },

  async findByEmail(email) {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE email=? LIMIT 1`, [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id,name,email,role,phone,is_active,created_at FROM users WHERE id=?`, [id]
    );
    return rows[0] || null;
  },

  async list({ limit = 20, offset = 0, role }) {
    const params = [];
    let where = '1=1';
    if (role) { where += ' AND role=?'; params.push(role); }
    const [rows] = await pool.query(
      `SELECT id,name,email,role,is_active,created_at FROM users
       WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users WHERE ${where}`, params
    );
    return { rows, total };
  },

  async update(id, fields) {
    const allowed = ['name', 'phone', 'role', 'is_active'];
    const sets = []; const params = [];
    for (const k of allowed) if (k in fields) { sets.push(`${k}=?`); params.push(fields[k]); }
    if (!sets.length) return;
    params.push(id);
    await pool.execute(`UPDATE users SET ${sets.join(',')} WHERE id=?`, params);
  },

  async remove(id) {
    await pool.execute(`DELETE FROM users WHERE id=?`, [id]);
  },
};

module.exports = UserModel;
