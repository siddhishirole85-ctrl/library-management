const router = require('express').Router();
const ah = require('../middleware/asyncHandler');
const { auth, authorize } = require('../middleware/auth');
const c = require('../controllers/fine.controller');

router.use(auth());

router.get('/me', ah(c.mine));
router.get('/user/:userId', authorize('admin','librarian'), ah(c.userFines));
router.post('/:id/pay',     authorize('admin','librarian'), ah(c.pay));

module.exports = router;
