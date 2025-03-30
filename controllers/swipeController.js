const swipeModel = require('../models/swipe');
const matchModel = require('../models/match');
const notificationModel = require('../models/notification');

const swipeController = {
  async createSwipe(req, res) {
    try {
        console.log("📌 Swipe request received:", req.body);
        const { userId } = req.user;
        const { targetUserId, direction } = req.body;

        console.log("✅ User ID:", userId);
        console.log("✅ Target User ID:", targetUserId);
        console.log("✅ Swipe Direction:", direction);

        // Validate direction
        if (!['left', 'right', 'super'].includes(direction)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid swipe direction'
            });
        }

        // Create swipe
        const swipe = await swipeModel.create(userId, targetUserId, direction);

        // 🚨 Cek jika swipe sudah ada sebelumnya
        if (swipe.alreadyExists) {
            return res.status(409).json({
                success: false,
                message: 'Swipe already exists'
            });
        }

        console.log("✔️ Swipe recorded:", swipe);

        let match = null;
        if (direction === 'right' || direction === 'super') {
            const isMatch = await swipeModel.checkMutualLike(userId, targetUserId);
            console.log("🔍 Checking mutual like:", isMatch);

            if (isMatch) {
                match = await matchModel.create(userId, targetUserId);
                console.log("🎉 Match created:", match);

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

                console.log("🔔 Notifications sent");
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
        console.error("❌ Swipe error:", error);
        res.status(500).json({
            success: false,
            message: 'Error recording swipe'
        });
    }
  }
};

module.exports = swipeController;