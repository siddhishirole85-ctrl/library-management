const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');

exports.list = async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const data = await UserModel.list({ limit: Number(limit), offset, role });
  res.json({ page: Number(page), limit: Number(limit), ...data });
};

exports.get = async (req, res) => {
  const u = await UserModel.findById(req.params.id);
  if (!u) { const e = new Error('User not found'); e.status = 404; throw e; }
  res.json({ user: u });
};

// Admin can create staff (librarian/admin) accounts directly.
exports.create = async (req, res) => {
  const { name, email, password, role = 'librarian', phone } = req.body;
  if (await UserModel.findByEmail(email)) {
    const e = new Error('Email already registered'); e.status = 409; throw e;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, password_hash: hash, role, phone });
  res.status(201).json({ user });
};

exports.update = async (req, res) => {
  await UserModel.update(req.params.id, req.body);
  res.json({ ok: true });
};

exports.remove = async (req, res) => {
  await UserModel.remove(req.params.id);
  res.json({ ok: true });
};
