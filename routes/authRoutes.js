// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validators = require('../middlewares/validators');

router.post('/register', validators.validateRegister, authController.register);
router.post('/login', validators.validateLogin, authController.login);

module.exports = router;