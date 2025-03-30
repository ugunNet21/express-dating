const db = require('../config/db');

class Notification {
  static async create({ userId, notificationType, content, relatedId }) {
    const { rows } = await db.query(
      `INSERT INTO notifications 
       (user_id, notification_type, content, related_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, notificationType, content, relatedId]
    );
    return rows[0];
  }

  static async getUserNotifications(userId) {
    const { rows } = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    return rows;
  }

  static async markAsRead(notificationId) {
    const { rows } = await db.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE notification_id = $1 
       RETURNING *`,
      [notificationId]
    );
    return rows[0];
  }
}

module.exports = Notification;