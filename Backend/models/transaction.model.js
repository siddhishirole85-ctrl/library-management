// Issue/return logic — uses transactions + row locks to prevent
// double-issuing the same copy under concurrent requests.
const { pool } = require('../config/db');

const LOAN_DAYS = Number(process.env.LOAN_PERIOD_DAYS) || 14;
const MAX_BOOKS = Number(process.env.MAX_BOOKS_PER_MEMBER) || 5;
const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 1;

const TransactionModel = {
  /**
   * Issue an available copy of a book to a user.
   * Business rules:
   *  - User must not exceed MAX_BOOKS active loans
   *  - User must not already have an active loan for the same book (no duplicate issue)
   *  - A copy in 'available' state must exist
   */
  async issue({ user_id, book_id, issued_by }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1) Active-loan count
      const [[{ active }]] = await conn.query(
        `SELECT COUNT(*) AS active FROM transactions
         WHERE user_id=? AND status='issued'`, [user_id]);
      if (active >= MAX_BOOKS) {
        const e = new Error(`Loan limit reached (${MAX_BOOKS}).`); e.status = 400; throw e;
      }

      // 2) Duplicate-issue guard for same title
      const [[dup]] = await conn.query(
        `SELECT t.id FROM transactions t
         JOIN book_copies c ON c.id=t.copy_id
         WHERE t.user_id=? AND c.book_id=? AND t.status='issued' LIMIT 1`,
        [user_id, book_id]);
      if (dup) { const e = new Error('You already have this book issued.'); e.status = 400; throw e; }

      // 3) Lock first available copy (FOR UPDATE prevents race)
      const [copies] = await conn.query(
        `SELECT id FROM book_copies
         WHERE book_id=? AND status='available' LIMIT 1 FOR UPDATE`, [book_id]);
      if (!copies.length) { const e = new Error('No copies available.'); e.status = 409; throw e; }
      const copyId = copies[0].id;

      // 4) Mark copy issued + create transaction
      await conn.execute(`UPDATE book_copies SET status='issued' WHERE id=?`, [copyId]);
      const due = new Date(Date.now() + LOAN_DAYS * 86400_000);
      const [r] = await conn.execute(
        `INSERT INTO transactions (user_id,copy_id,issued_by,due_at) VALUES (?,?,?,?)`,
        [user_id, copyId, issued_by || null, due]);

      await conn.commit();
      return { transaction_id: r.insertId, copy_id: copyId, due_at: due };
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  },

  /**
   * Return a book. Computes overdue fine if any.
   */
  async returnBook(transaction_id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [[tx]] = await conn.query(
        `SELECT * FROM transactions WHERE id=? FOR UPDATE`, [transaction_id]);
      if (!tx) { const e = new Error('Transaction not found'); e.status = 404; throw e; }
      if (tx.status !== 'issued') { const e = new Error('Already returned'); e.status = 400; throw e; }

      const now = new Date();
      const due = new Date(tx.due_at);
      const overdueDays = Math.max(0, Math.ceil((now - due) / 86400_000));
      const fineAmount = +(overdueDays * FINE_PER_DAY).toFixed(2);

      await conn.execute(
        `UPDATE transactions SET status='returned', returned_at=? WHERE id=?`, [now, transaction_id]);
      await conn.execute(`UPDATE book_copies SET status='available' WHERE id=?`, [tx.copy_id]);

      if (fineAmount > 0) {
        await conn.execute(
          `INSERT INTO fines (transaction_id,user_id,amount) VALUES (?,?,?)`,
          [transaction_id, tx.user_id, fineAmount]);
      }
      await conn.commit();
      return { returned_at: now, overdue_days: overdueDays, fine: fineAmount };
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  },

  async listForUser(user_id, { status } = {}) {
    const params = [user_id]; let where = 'user_id=?';
    if (status) { where += ' AND status=?'; params.push(status); }
    const [rows] = await pool.query(
      `SELECT t.*, c.barcode, b.title FROM transactions t
       JOIN book_copies c ON c.id=t.copy_id
       JOIN books b ON b.id=c.book_id
       WHERE ${where} ORDER BY t.issued_at DESC`, params);
    return rows;
  },
};

module.exports = TransactionModel;
