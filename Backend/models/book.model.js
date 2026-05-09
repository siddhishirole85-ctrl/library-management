const { pool } = require('../config/db');

const BookModel = {
  async create({ title, isbn, category_id, publisher, published_year, description, author_ids = [] }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [r] = await conn.execute(
        `INSERT INTO books (title,isbn,category_id,publisher,published_year,description)
         VALUES (?,?,?,?,?,?)`,
        [title, isbn || null, category_id || null, publisher || null, published_year || null, description || null]
      );
      const bookId = r.insertId;
      for (const aid of author_ids) {
        await conn.execute(`INSERT IGNORE INTO book_authors (book_id,author_id) VALUES (?,?)`, [bookId, aid]);
      }
      await conn.commit();
      return { id: bookId };
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  },

  async findById(id) {
    const [[book]] = await pool.execute(
      `SELECT b.*, c.name AS category_name FROM books b
       LEFT JOIN categories c ON c.id=b.category_id WHERE b.id=?`, [id]);
    if (!book) return null;
    const [authors] = await pool.execute(
      `SELECT a.id,a.name FROM authors a
       JOIN book_authors ba ON ba.author_id=a.id WHERE ba.book_id=?`, [id]);
    const [[{ available }]] = await pool.execute(
      `SELECT COUNT(*) AS available FROM book_copies WHERE book_id=? AND status='available'`, [id]);
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM book_copies WHERE book_id=?`, [id]);
    return { ...book, authors, copies_available: available, copies_total: total };
  },

  // Search & filter with pagination. Filters: q, category_id, author_id.
  async search({ q, category_id, author_id, limit = 20, offset = 0 }) {
    const where = ['1=1']; const params = [];
    let join = '';
    if (q) {
      where.push('(b.title LIKE ? OR b.isbn LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category_id) { where.push('b.category_id=?'); params.push(Number(category_id)); }
    if (author_id) {
      join = 'JOIN book_authors ba ON ba.book_id=b.id';
      where.push('ba.author_id=?'); params.push(Number(author_id));
    }
    const sql = `
      SELECT b.id,b.title,b.isbn,b.published_year,c.name AS category,
        (SELECT COUNT(*) FROM book_copies WHERE book_id=b.id AND status='available') AS available
      FROM books b
      LEFT JOIN categories c ON c.id=b.category_id
      ${join}
      WHERE ${where.join(' AND ')}
      GROUP BY b.id
      ORDER BY b.id DESC
      LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(sql, [...params, Number(limit), Number(offset)]);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(DISTINCT b.id) AS total FROM books b ${join} WHERE ${where.join(' AND ')}`, params);
    return { rows, total };
  },

  async update(id, fields) {
    const allowed = ['title', 'isbn', 'category_id', 'publisher', 'published_year', 'description'];
    const sets = []; const params = [];
    for (const k of allowed) if (k in fields) { sets.push(`${k}=?`); params.push(fields[k]); }
    if (sets.length) {
      params.push(id);
      await pool.execute(`UPDATE books SET ${sets.join(',')} WHERE id=?`, params);
    }
    if (Array.isArray(fields.author_ids)) {
      await pool.execute(`DELETE FROM book_authors WHERE book_id=?`, [id]);
      for (const aid of fields.author_ids) {
        await pool.execute(`INSERT IGNORE INTO book_authors (book_id,author_id) VALUES (?,?)`, [id, aid]);
      }
    }
  },

  async remove(id) { await pool.execute(`DELETE FROM books WHERE id=?`, [id]); },

  async addCopy(book_id, barcode, shelf_loc) {
    const [r] = await pool.execute(
      `INSERT INTO book_copies (book_id,barcode,shelf_loc) VALUES (?,?,?)`,
      [book_id, barcode, shelf_loc || null]);
    return { id: r.insertId };
  },
};

module.exports = BookModel;
