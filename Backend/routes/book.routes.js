const router = require('express').Router();
const Joi = require('joi');
const ah = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { auth, authorize } = require('../middleware/auth');
const c = require('../controllers/book.controller');

// Public catalog browse
router.get('/',     ah(c.list));
router.get('/:id',  ah(c.get));

// Staff-only mutations
router.post('/', auth(), authorize('admin','librarian'),
  validate({ body: Joi.object({
    title: Joi.string().required(),
    isbn: Joi.string().max(20).allow(null,''),
    category_id: Joi.number().integer().optional(),
    publisher: Joi.string().allow(null,''),
    published_year: Joi.number().integer().min(1000).max(9999).optional(),
    description: Joi.string().allow(null,''),
    author_ids: Joi.array().items(Joi.number().integer()).default([]),
  }) }), ah(c.create));

router.put('/:id',    auth(), authorize('admin','librarian'), ah(c.update));
router.delete('/:id', auth(), authorize('admin'),             ah(c.remove));

router.post('/:id/copies', auth(), authorize('admin','librarian'),
  validate({ body: Joi.object({
    barcode: Joi.string().required(),
    shelf_loc: Joi.string().optional(),
  }) }), ah(c.addCopy));

module.exports = router;
