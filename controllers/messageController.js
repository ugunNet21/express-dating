const Message = require('../models/message');
const Notification = require('../models/notification');

module.exports = {
  async sendMessage(req, res) {
    try {
      const { matchId } = req.params;
      const { userId } = req;
      const { messageText } = req.body;

      const message = await Message.create({
        matchId,
        senderId: userId,
        messageText
      });

      // Get the other user in the match
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

      // Create notification
      await Notification.create({
        userId: rows[0].receiver_id,
        notificationType: 'message',
        content: 'You have a new message',
        relatedId: matchId
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      console.error('Message error:', error);
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