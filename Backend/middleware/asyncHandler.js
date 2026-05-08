// Wraps async route handlers so thrown errors reach errorHandler
// without try/catch boilerplate in every controller.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
