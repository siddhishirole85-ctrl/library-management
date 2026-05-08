const router = require('express').Router();
const Joi = require('joi');
const ah = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { auth, authorize } = require('../middleware/auth');
const c = require('../controllers/user.controller');

router.use(auth());

router.get('/',  authorize('admin','librarian'), ah(c.list));
router.post('/', authorize('admin'),
  validate({ body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('admin','librarian','member').default('librarian'),
    phone: Joi.string().optional(),
  }) }), ah(c.create));

router.get('/:id',    authorize('admin','librarian'), ah(c.get));
router.put('/:id',    authorize('admin'), ah(c.update));
router.delete('/:id', authorize('admin'), ah(c.remove));

module.exports = router;
