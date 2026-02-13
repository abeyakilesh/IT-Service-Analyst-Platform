const router = require('express').Router();
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/auth');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/profile', protect, getProfile);

module.exports = router;
