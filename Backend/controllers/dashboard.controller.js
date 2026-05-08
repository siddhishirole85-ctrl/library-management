const { pool } = require('../config/db');

exports.stats = async (_req, res) => {
  const [[users]]   = await pool.query(`SELECT COUNT(*) AS c FROM users`);
  const [[books]]   = await pool.query(`SELECT COUNT(*) AS c FROM books`);
  const [[copies]]  = await pool.query(`SELECT COUNT(*) AS c FROM book_copies`);
  const [[issued]]  = await pool.query(`SELECT COUNT(*) AS c FROM transactions WHERE status='issued'`);
  const [[overdue]] = await pool.query(
    `SELECT COUNT(*) AS c FROM transactions WHERE status='issued' AND due_at < NOW()`);
  const [[fines]]   = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM fines WHERE paid=0`);

  res.json({
    users: users.c, books: books.c, copies: copies.c,
    active_loans: issued.c, overdue_loans: overdue.c,
    unpaid_fines_total: Number(fines.total),
  });
};
