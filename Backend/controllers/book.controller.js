const BookModel = require('../models/book.model');

exports.list = async (req, res) => {
  const { q, category_id, author_id, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const data = await BookModel.search({ q, category_id, author_id, limit: Number(limit), offset });
  res.json({ page: Number(page), limit: Number(limit), ...data });
};

exports.get = async (req, res) => {
  const b = await BookModel.findById(req.params.id);
  if (!b) { const e = new Error('Book not found'); e.status = 404; throw e; }
  res.json({ book: b });
};

exports.create = async (req, res) => {
  const created = await BookModel.create(req.body);
  res.status(201).json(created);
};

exports.update = async (req, res) => {
  await BookModel.update(req.params.id, req.body);
  res.json({ ok: true });
};

exports.remove = async (req, res) => {
  await BookModel.remove(req.params.id);
  res.json({ ok: true });
};

exports.addCopy = async (req, res) => {
  const { barcode, shelf_loc } = req.body;
  const out = await BookModel.addCopy(req.params.id, barcode, shelf_loc);
  res.status(201).json(out);
};
