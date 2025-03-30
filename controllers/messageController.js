const Message = require('../models/message');
const Notification = require('../models/notification');
const db = require('../config/db');

module.exports = {
  async sendMessage(req, res) {
    try {
      const { matchId } = req.params;
      const { userId } = req;
      const { messageText } = req.body;

      // Cek apakah user adalah bagian dari match ini
      const matchCheck = await db.query(
        `SELECT * FROM matches 
         WHERE match_id = $1 
         AND (user_id_1 = $2 OR user_id_2 = $2)`,
        [matchId, userId]
      );

      if (matchCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to send messages in this match'
        });
      }

      const message = await Message.create({
        matchId,
        senderId: userId,
        messageText
      });

      console.log("✅ Message successfully saved:", message);

      // Ambil penerima pesan
      const { rows } = await db.query(
        `SELECT 
          CASE 
            WHEN user_id_1 = $1 THEN user_id_2
            ELSE user_id_1
          END as receiver_id
         FROM matches 
         WHERE match_id = $2`,
        [userId, matchId]
      );

      console.log("📩 Receiver ID:", rows[0]?.receiver_id);

      if (!rows.length) {
        console.warn("⚠️ Warning: No receiver found for match", matchId);
      }

      // Buat notifikasi
      await Notification.create({
        userId: rows[0].receiver_id,
        notificationType: 'message',
        content: 'You have a new message',
        relatedId: matchId
      });

      console.log("🔔 Notification created successfully");

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });

    } catch (error) {
      console.error("❌ Error in sendMessage:", error);
      res.status(500).json({
        success: false,
        message: 'Error sending message'
      });
    }
  },

  async getMessages(req, res) {
    try {
      const { matchId } = req.params;
      const messages = await Message.getByMatchId(matchId);
      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting messages'
      });
    }
  }
};