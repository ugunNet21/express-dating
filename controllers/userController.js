const db = require('../config/db');
const User = require('../models/user');

module.exports = {
  async getProfile(req, res) {
    try {
      const { userId } = req;
      
      const { rows } = await db.query(
        `SELECT 
          user_id, email, first_name, last_name, birth_date, gender, bio,
          location_lat, location_lng, verification_status
         FROM users 
         WHERE user_id = $1`,
        [userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting profile'
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const { userId } = req;
      const { first_name, last_name, bio, gender } = req.body; 
  
      console.log("Updating user:", userId);
      console.log("Data received:", { first_name, last_name, bio, gender });
  
      if (!first_name || !last_name) {
        return res.status(400).json({
          success: false,
          message: "First name and last name are required."
        });
      }
  
      const { rows } = await db.query(
        `UPDATE users 
         SET first_name = $1, last_name = $2, bio = $3, gender = $4, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5
         RETURNING user_id, first_name, last_name, bio, gender`,
        [first_name, last_name, bio, gender, userId]
      );
  
      console.log("Update result:", rows);
  
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      res.json({
        success: true,
        message: "Profile updated successfully",
        data: rows[0]
      });
  
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile",
        error: error.message
      });
    }
  },

  async getUserPhotos(req, res) {
    try {
      const { id } = req.params;
      
      const { rows } = await db.query(
        `SELECT photo_id, photo_url, is_primary 
         FROM user_photos 
         WHERE user_id = $1 
         ORDER BY sort_order`,
        [id]
      );

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Photos error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting photos'
      });
    }
  }
};