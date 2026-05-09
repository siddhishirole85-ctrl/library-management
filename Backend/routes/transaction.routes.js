const router = require('express').Router();
const Joi = require('joi');
const ah = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { auth, authorize } = require('../middleware/auth');
const c = require('../controllers/transaction.controller');

router.use(auth());

// Issue and return are librarian/admin actions
router.post('/issue', authorize('admin','librarian'),
  validate({ body: Joi.object({
    user_id: Joi.number().integer().required(),
    book_id: Joi.number().integer().required(),
  }) }), ah(c.issue));

router.post('/:id/return', authorize('admin','librarian'), ah(c.returnBook));

// Members see their own loans
router.get('/me', ah(c.myLoans));

// Staff inspect any user's loans
router.get('/user/:userId', authorize('admin','librarian'), ah(c.userLoans));

module.exports = router;
