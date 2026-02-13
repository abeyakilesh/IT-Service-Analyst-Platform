const router = require('express').Router();
const { getSLAs, getSLAByCategory, createSLA } = require('../controllers/slaController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getSLAs).post(authorize('admin'), createSLA);
router.route('/:categoryId').get(getSLAByCategory);

module.exports = router;
