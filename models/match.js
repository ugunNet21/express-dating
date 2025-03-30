const db = require('../config/db');

const matchModel = {
  // Create a new match
  async create(user1Id, user2Id) {
    // Ensure user_id_1 is always the smaller id to maintain uniqueness constraint
    const smallerId = Math.min(user1Id, user2Id);
    const largerId = Math.max(user1Id, user2Id);
    
    const query = `
      INSERT INTO matches (user_id_1, user_id_2)
      VALUES ($1, $2)
      RETURNING match_id, user_id_1, user_id_2, created_at, is_active
    `;
    
    const result = await db.query(query, [smallerId, largerId]);
    return result.rows[0];
  },
  
  // Get all matches for a user
  async getUserMatches(userId) {
    const query = `
      SELECT m.match_id, 
             CASE
               WHEN m.user_id_1 = $1 THEN m.user_id_2
               ELSE m.user_id_1
             END as matched_user_id,
             u.first_name, u.last_name, u.bio,
             (SELECT photo_url FROM user_photos 
              WHERE user_id = CASE
                      WHEN m.user_id_1 = $1 THEN m.user_id_2
                      ELSE m.user_id_1
                    END
              AND is_primary = true
              LIMIT 1) as profile_photo,
             m.created_at, m.last_message_at,
             EXISTS (
               SELECT 1 FROM messages msg
               WHERE msg.match_id = m.match_id
               AND msg.sender_id != $1
               AND msg.is_read = false
             ) as has_unread
      FROM matches m
      JOIN users u ON (m.user_id_1 = $1 AND m.user_id_2 = u.user_id) 
               OR (m.user_id_2 = $1 AND m.user_id_1 = u.user_id)
      WHERE (m.user_id_1 = $1 OR m.user_id_2 = $1)
      AND m.is_active = true
      ORDER BY m.last_message_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
};

module.exports = matchModel;