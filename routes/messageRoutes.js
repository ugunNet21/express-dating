const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const messageController = require('../controllers/messageController');

router.post('/:matchId', auth.authenticate, messageController.sendMessage);
router.get('/:matchId', auth.authenticate, messageController.getMessages);

module.exports = router;