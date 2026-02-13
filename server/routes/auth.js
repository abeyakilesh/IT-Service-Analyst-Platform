const router = require('express').Router();
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/auth');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);
router.get('/profile', protect, getProfile);

module.exports = router;
