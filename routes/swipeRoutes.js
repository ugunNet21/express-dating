const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const swipeController = require('../controllers/swipeController');

router.post('/', auth.authenticate, swipeController.createSwipe);

module.exports = router;