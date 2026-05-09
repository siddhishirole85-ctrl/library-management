const FineModel = require('../models/fine.model');

exports.mine = async (req, res) => {
  res.json({ fines: await FineModel.listForUser(req.user.id) });
};
exports.userFines = async (req, res) => {
  res.json({ fines: await FineModel.listForUser(Number(req.params.userId)) });
};
exports.pay = async (req, res) => {
  await FineModel.pay(Number(req.params.id));
  res.json({ ok: true });
};
