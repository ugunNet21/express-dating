// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');

router.get('/me', auth.authenticate, userController.getProfile);
router.put('/me', auth.authenticate, userController.updateProfile);
router.get('/:id/photos', userController.getUserPhotos);

module.exports = router;