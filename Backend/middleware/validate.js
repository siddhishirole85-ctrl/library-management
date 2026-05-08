// Joi-based request validator. Pass a schema map: { body, params, query }.
module.exports = (schemas) => (req, _res, next) => {
  for (const key of ['body', 'params', 'query']) {
    if (!schemas[key]) continue;
    const { error, value } = schemas[key].validate(req[key], { abortEarly: false, stripUnknown: true });
    if (error) {
      const err = new Error('Validation failed');
      err.status = 400;
      err.details = error.details.map(d => d.message);
      return next(err);
    }
    req[key] = value;
  }
  next();
};
