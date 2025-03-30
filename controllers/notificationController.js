const Notification = require('../models/notification');

module.exports = {
  async getNotifications(req, res) {
    try {
      const { userId } = req;
      const notifications = await Notification.getUserNotifications(userId);
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting notifications'
      });
    }
  },

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await Notification.markAsRead(notificationId);
      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking notification as read'
      });
    }
  }
};