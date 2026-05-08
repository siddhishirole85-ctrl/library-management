const { pool } = require('../config/db');

module.exports = {
  async listForUser(user_id) {
    const [rows] = await pool.query(
      `SELECT f.*, t.copy_id FROM fines f
       JOIN transactions t ON t.id=f.transaction_id
       WHERE f.user_id=? ORDER BY f.created_at DESC`, [user_id]);
    return rows;
  },
  async pay(id) {
    await pool.execute(`UPDATE fines SET paid=1, paid_at=NOW() WHERE id=?`, [id]);
  },
};
