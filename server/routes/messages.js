const router = require('express').Router({ mergeParams: true });
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getMessages)
    .post(sendMessage);

module.exports = router;
