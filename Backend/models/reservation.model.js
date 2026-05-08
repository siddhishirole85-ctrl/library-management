const { pool } = require('../config/db');

module.exports = {
  async create(user_id, book_id) {
    // Only allow reservation if no copy is currently available
    const [[{ available }]] = await pool.query(
      `SELECT COUNT(*) AS available FROM book_copies WHERE book_id=? AND status='available'`, [book_id]);
    if (available > 0) { const e = new Error('Copies available — issue instead.'); e.status = 400; throw e; }
    try {
      const [r] = await pool.execute(
        `INSERT INTO reservations (user_id,book_id) VALUES (?,?)`, [user_id, book_id]);
      return { id: r.insertId };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') { const e = new Error('Already reserved'); e.status = 409; throw e; }
      throw err;
    }
  },
  async cancel(id, user_id) {
    await pool.execute(
      `UPDATE reservations SET status='cancelled' WHERE id=? AND user_id=? AND status='active'`,
      [id, user_id]);
  },
  async listForUser(user_id) {
    const [rows] = await pool.query(
      `SELECT r.*, b.title FROM reservations r
       JOIN books b ON b.id=r.book_id
       WHERE r.user_id=? ORDER BY r.reserved_at DESC`, [user_id]);
    return rows;
  },
};
