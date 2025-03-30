const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded Token:', decoded); 
      const { rows } = await db.query(
        'SELECT user_id FROM users WHERE user_id = $1',
        [decoded.userId]
      );
      
      console.log('User in DB:', rows);

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
  }
};