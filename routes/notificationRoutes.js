const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', auth.authenticate, notificationController.getNotifications);
router.put('/:notificationId/read', auth.authenticate, notificationController.markAsRead);

module.exports = router;
