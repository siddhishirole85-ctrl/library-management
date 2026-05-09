// Centralized Express error handler. Controllers `throw` or `next(err)`;
// we normalize the response shape here.
module.exports = (err, _req, res, _next) => {
  const status = err.status || 500;
  const payload = {
    error: err.message || 'Internal server error',
  };
  if (err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== 'production' && status === 500) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
};
