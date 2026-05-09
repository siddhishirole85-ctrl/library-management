const ReservationModel = require('../models/reservation.model');

exports.create = async (req, res) => {
  const out = await ReservationModel.create(req.user.id, req.body.book_id);
  res.status(201).json(out);
};
exports.cancel = async (req, res) => {
  await ReservationModel.cancel(Number(req.params.id), req.user.id);
  res.json({ ok: true });
};
exports.mine = async (req, res) => {
  res.json({ reservations: await ReservationModel.listForUser(req.user.id) });
};
