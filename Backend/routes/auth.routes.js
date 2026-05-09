const router = require('express').Router();
const Joi = require('joi');
const ah = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const c = require('../controllers/auth.controller');

router.post('/register',
  validate({ body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
    phone: Joi.string().max(20).optional(),
  }) }),
  ah(c.register));

router.post('/login',
  validate({ body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }) }),
  ah(c.login));

router.get('/me', auth(), ah(c.me));

module.exports = router;
