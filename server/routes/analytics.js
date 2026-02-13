const router = require('express').Router();
const { getSummary, getReports, generateReport } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'analyst'));

router.get('/summary', getSummary);
router.get('/reports', authorize('admin'), getReports);
router.post('/reports/generate', authorize('admin'), generateReport);

module.exports = router;
