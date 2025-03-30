const db = require('../config/db');

const swipeModel = {
  // Create a new swipe
  async create(swiperId, swipedUserId, direction) {
    try {
      // 🔍 Cek apakah sudah ada swipe sebelumnya
      const existingSwipe = await db.query(
        'SELECT * FROM swipes WHERE swiper_id = $1 AND swiped_user_id = $2',
        [swiperId, swipedUserId]
      );

      if (existingSwipe.rows.length > 0) {
        return { alreadyExists: true }; // 🚨 Tanda kalau swipe sudah ada
      }

      // Jika belum ada, buat swipe baru
      const query = `
        INSERT INTO swipes (swiper_id, swiped_user_id, direction)
        VALUES ($1, $2, $3)
        RETURNING swipe_id, swiper_id, swiped_user_id, direction, created_at
      `;

      const result = await db.query(query, [swiperId, swipedUserId, direction]);
      return result.rows[0];

    } catch (error) {
      console.error('Swipe Model Error:', error);
      throw error;
    }
  },
  
  // Check if there's a mutual like (for match creation)
  async checkMutualLike(user1Id, user2Id) {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM swipes
        WHERE swiper_id = $1 AND swiped_user_id = $2 AND direction = 'right'
      ) AND EXISTS (
        SELECT 1 FROM swipes
        WHERE swiper_id = $2 AND swiped_user_id = $1 AND direction = 'right'
      ) as is_match
    `;
    
    const result = await db.query(query, [user1Id, user2Id]);
    return result.rows[0].is_match;
  }
};

module.exports = swipeModel;