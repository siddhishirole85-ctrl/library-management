const TransactionModel = require('../models/transaction.model');

exports.issue = async (req, res) => {
  const { user_id, book_id } = req.body;
  const out = await TransactionModel.issue({ user_id, book_id, issued_by: req.user.id });
  res.status(201).json(out);
};

exports.returnBook = async (req, res) => {
  const out = await TransactionModel.returnBook(Number(req.params.id));
  res.json(out);
};

exports.myLoans = async (req, res) => {
  const rows = await TransactionModel.listForUser(req.user.id, { status: req.query.status });
  res.json({ loans: rows });
};

exports.userLoans = async (req, res) => {
  const rows = await TransactionModel.listForUser(Number(req.params.userId), { status: req.query.status });
  res.json({ loans: rows });
};
