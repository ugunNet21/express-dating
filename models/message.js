const db = require('../config/db');

class Message {
  static async create({ matchId, senderId, messageText }) {
    const { rows } = await db.query(
      `INSERT INTO messages 
       (match_id, sender_id, message_text) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [matchId, senderId, messageText]
    );
    return rows[0];
  }

  static async getByMatchId(matchId) {
    const { rows } = await db.query(
      `SELECT * FROM messages 
       WHERE match_id = $1 
       ORDER BY sent_at ASC`,
      [matchId]
    );
    return rows;
  }

  static async markAsRead(messageId) {
    const { rows } = await db.query(
      `UPDATE messages 
       SET is_read = true, read_at = CURRENT_TIMESTAMP 
       WHERE message_id = $1 
       RETURNING *`,
      [messageId]
    );
    return rows[0];
  }
}

module.exports = Message;