const express = require('express');
const router = express.Router();
const swipeController = require('../controllers/swipe');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware); // Apply auth middleware to all swipe routes

router.post('/', swipeController.createSwipe);

module.exports = router;