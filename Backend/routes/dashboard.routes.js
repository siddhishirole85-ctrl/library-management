const router = require('express').Router();
const ah = require('../middleware/asyncHandler');
const { auth, authorize } = require('../middleware/auth');
const c = require('../controllers/dashboard.controller');

router.get('/stats', auth(), authorize('admin','librarian'), ah(c.stats));

module.exports = router;
