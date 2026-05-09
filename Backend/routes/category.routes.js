const router = require('express').Router();
const ah = require('../middleware/asyncHandler');
const { auth, authorize } = require('../middleware/auth');
const c = require('../controllers/simple.controller').categories;

router.get('/', ah(c.list));
router.post('/',   auth(), authorize('admin','librarian'), ah(c.create));
router.put('/:id', auth(), authorize('admin','librarian'), ah(c.update));
router.delete('/:id', auth(), authorize('admin'), ah(c.remove));

module.exports = router;
