const { check, validationResult } = require('express-validator');

module.exports = {
  validateRegister: [
    check('email').isEmail().withMessage('Invalid email'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    check('firstName').notEmpty().withMessage('First name is required'),
    check('birthDate').isDate().withMessage('Invalid birth date'),
    check('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      next();
    }
  ],

  validateLogin: [
    check('email').isEmail().withMessage('Invalid email'),
    check('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      next();
    }
  ]
};