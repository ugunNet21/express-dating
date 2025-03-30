const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/user');

const authController = {
  async register(req, res) {
    try {
      const userData = req.body;
      
      // Basic validation
      if (!userData.email || !userData.password || !userData.first_name) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      // Check if user already exists
      const existingUser = await userModel.getByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
      
      // Create new user
      const newUser = await userModel.create(userData);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.user_id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser.user_id,
            email: newUser.email,
            firstName: newUser.first_name
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user'
      });
    }
  },
  
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Check if user exists
      const user = await userModel.getByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check if account is active
      if (user.account_status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active'
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Update last active timestamp
      await userModel.updateLastActive(user.user_id);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.user_id,
            email: user.email,
            firstName: user.first_name
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during login'
      });
    }
  }
};

module.exports = authController;