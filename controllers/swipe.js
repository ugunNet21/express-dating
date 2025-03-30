const swipeModel = require('../models/swipe');
const matchModel = require('../models/match');
const notificationModel = require('../models/notification'); // You'll need to create this

const swipeController = {
  async createSwipe(req, res) {
    try {
      const { userId } = req.user;
      const { targetUserId, direction } = req.body;
      
      // Validate direction
      if (!['left', 'right', 'super'].includes(direction)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid swipe direction'
        });
      }
      
      // Create swipe
      const swipe = await swipeModel.create(userId, targetUserId, direction);
      
      // If it's a right/super swipe, check for a match
      let match = null;
      if (direction === 'right' || direction === 'super') {
        const isMatch = await swipeModel.checkMutualLike(userId, targetUserId);
        
        if (isMatch) {
          // Create a match
          match = await matchModel.create(userId, targetUserId);
          
          // Create notifications for both users
          await notificationModel.create({
            userId: userId,
            notificationType: 'match',
            content: 'You have a new match!',
            relatedId: match.match_id
          });
          
          await notificationModel.create({
            userId: targetUserId,
            notificationType: 'match',
            content: 'You have a new match!',
            relatedId: match.match_id
          });
        }
      }
      
      res.status(201).json({
        success: true,
        message: 'Swipe recorded successfully',
        data: {
          swipe,
          match: match ? {
            matchId: match.match_id,
            createdAt: match.created_at
          } : null
        }
      });
    } catch (error) {
      console.error('Swipe error:', error);
      res.status(500).json({
        success: false,
        message: 'Error recording swipe'
      });
    }
  },
  
  // Additional methods can be added here
};

module.exports = swipeController;