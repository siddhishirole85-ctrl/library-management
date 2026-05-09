const router = require('express').Router();
const Joi = require('joi');
const ah = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const c = require('../controllers/reservation.controller');

router.use(auth());

router.post('/',
  validate({ body: Joi.object({ book_id: Joi.number().integer().required() }) }),
  ah(c.create));

router.get('/me', ah(c.mine));
router.delete('/:id', ah(c.cancel));

module.exports = router;
