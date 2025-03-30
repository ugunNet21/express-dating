const db = require('../config/db');
const bcrypt = require('bcrypt');

const userModel = {
  // Create a new user
  async create(userData) {
    const { email, phone_number, password, first_name, last_name, 
            birth_date, gender, bio } = userData;
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, phone_number, password_hash, first_name, 
                        last_name, birth_date, gender, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id, email, first_name, last_name, gender, created_at
    `;
    
    const values = [
      email, phone_number, password_hash, first_name, 
      last_name, birth_date, gender, bio
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  // Get user by ID
  async getById(userId) {
    const query = `
      SELECT user_id, email, phone_number, first_name, last_name, 
             birth_date, gender, bio, location_lat, location_lng, 
             last_active, account_status, verification_status, created_at
      FROM users
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows[0];
  },
  
  // Get user by email (for login)
  async getByEmail(email) {
    const query = `
      SELECT user_id, email, password_hash, first_name, last_name, account_status
      FROM users
      WHERE email = $1
    `;
    
    const result = await db.query(query, [email]);
    return result.rows[0];
  },
  
  // Update user profile
  async update(userId, userData) {
    const { first_name, last_name, bio, location_lat, location_lng } = userData;
    
    const query = `
      UPDATE users
      SET first_name = $2,
          last_name = $3,
          bio = $4,
          location_lat = $5,
          location_lng = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING user_id, first_name, last_name, bio, location_lat, location_lng
    `;
    
    const values = [userId, first_name, last_name, bio, location_lat, location_lng];
    
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  // Update user's last active time
  async updateLastActive(userId) {
    const query = `
      UPDATE users
      SET last_active = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `;
    
    await db.query(query, [userId]);
    return true;
  },
  
  // Get users for matching (based on preferences)
  async getPotentialMatches(userId, preferences) {
    const { interested_in, min_age, max_age, max_distance } = preferences;
    
    // This is a simplified query - in a real app, you'd need more complex distance calculations
    // and additional filtering based on user preferences
    const query = `
      SELECT u.user_id, u.first_name, u.last_name, u.gender, u.bio, 
             u.location_lat, u.location_lng, 
             EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.birth_date)) as age
      FROM users u
      WHERE u.user_id != $1
      AND u.gender = ANY($2)
      AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.birth_date)) BETWEEN $3 AND $4
      AND u.account_status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM swipes 
        WHERE swiper_id = $1 AND swiped_user_id = u.user_id
      )
      LIMIT 20
    `;
    
    const values = [userId, interested_in, min_age, max_age];
    
    const result = await db.query(query, values);
    return result.rows;
  }
};

module.exports = userModel;