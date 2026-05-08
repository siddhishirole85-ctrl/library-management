const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}

exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const existing = await UserModel.findByEmail(email);
  if (existing) { const e = new Error('Email already registered'); e.status = 409; throw e; }
  const hash = await bcrypt.hash(password, 10);
  // Public registration always creates 'member'. Admins create staff via /users.
  const user = await UserModel.create({ name, email, password_hash: hash, role: 'member', phone });
  res.status(201).json({ user, token: signToken(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findByEmail(email);
  if (!user || !user.is_active) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
  const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ user: safe, token: signToken(safe) });
};

exports.me = async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  res.json({ user });
};
