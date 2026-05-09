// Lightweight CRUD helpers for authors and categories.
const { pool } = require('../config/db');

const Authors = {
  async list() { const [r] = await pool.query(`SELECT * FROM authors ORDER BY name`); return r; },
  async create(name, bio) {
    const [r] = await pool.execute(`INSERT INTO authors (name,bio) VALUES (?,?)`, [name, bio || null]);
    return { id: r.insertId };
  },
  async update(id, { name, bio }) {
    await pool.execute(`UPDATE authors SET name=COALESCE(?,name), bio=COALESCE(?,bio) WHERE id=?`,
      [name ?? null, bio ?? null, id]);
  },
  async remove(id) { await pool.execute(`DELETE FROM authors WHERE id=?`, [id]); },
};

const Categories = {
  async list() { const [r] = await pool.query(`SELECT * FROM categories ORDER BY name`); return r; },
  async create(name) {
    const [r] = await pool.execute(`INSERT INTO categories (name) VALUES (?)`, [name]);
    return { id: r.insertId };
  },
  async update(id, name) { await pool.execute(`UPDATE categories SET name=? WHERE id=?`, [name, id]); },
  async remove(id) { await pool.execute(`DELETE FROM categories WHERE id=?`, [id]); },
};

module.exports = { Authors, Categories };
