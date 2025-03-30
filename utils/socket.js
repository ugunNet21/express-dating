const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const messageModel = require('../models/message');
const userModel = require('../models/user');

function setupSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  
  // Authentication middleware for socket
  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      const token = socket.handshake.query.token;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    } else {
      next(new Error('Authentication error'));
    }
  });
  
  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.userId}`);
    
    // Join a room for the user to receive private messages
    socket.join(`user_${socket.user.userId}`);
    
    // Join rooms for all active matches
    joinUserMatchRooms(socket);
    
    // Update user's last active status
    userModel.updateLastActive(socket.user.userId);
    
    // Listen for new messages
    socket.on('send_message', async (data) => {
      try {
        const { matchId, text, attachments } = data;
        const senderId = socket.user.userId;
        
        // Save message to database
        const message = await messageModel.create({
          matchId,
          senderId,
          text,
          attachments
        });
        
        // Get recipient ID
        const match = await messageModel.getMatchById(matchId);
        const recipientId = match.user_id_1 === senderId ? match.user_id_2 : match.user_id_1;
        
        // Emit to match room
        io.to(`match_${matchId}`).emit('new_message', {
          messageId: message.message_id,
          matchId,
          senderId,
          text: message.message_text,
          sentAt: message.sent_at,
          isRead: false
        });
        
        // Emit to recipient's personal room (for notifications when not in the chat)
        io.to(`user_${recipientId}`).emit('message_notification', {
          messageId: message.message_id,
          matchId,
          senderId,
          text: message.message_text,
          sentAt: message.sent_at
        });
        
        // Update match's last_message_at
        await messageModel.updateMatchLastMessageTime(matchId);
      } catch (error) {
        console.error('Message sending error:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });
    
    // Listen for message read events
    socket.on('read_messages', async (data) => {
      try {
        const { matchId } = data;
        const userId = socket.user.userId;
        
        // Mark messages as read
        await messageModel.markMessagesAsRead(matchId, userId);
        
        // Get the other user in the match
        const match = await messageModel.getMatchById(matchId);
        const otherUserId = match.user_id_1 === userId ? match.user_id_2 : match.user_id_1;
        
        // Emit message read event to the other user
        io.to(`user_${otherUserId}`).emit('messages_read', {
          matchId,
          readerId: userId
        });
      } catch (error) {
        console.error('Message read error:', error);
      }
    });
    
    // Handle typing indicators
    socket.on('typing', (data) => {
      const { matchId } = data;
      const userId = socket.user.userId;
      
      socket.to(`match_${matchId}`).emit('user_typing', {
        matchId,
        userId
      });
    });
    
    // Handle stop typing
    socket.on('stop_typing', (data) => {
      const { matchId } = data;
      const userId = socket.user.userId;
      
      socket.to(`match_${matchId}`).emit('user_stopped_typing', {
        matchId,
        userId
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.userId}`);
      // Update last active status
      userModel.updateLastActive(socket.user.userId);
    });
  });
  
  // Helper function to join user to all their match rooms
  async function joinUserMatchRooms(socket) {
    try {
      const userId = socket.user.userId;
      const userMatches = await messageModel.getUserMatchIds(userId);
      
      userMatches.forEach(match => {
        socket.join(`match_${match.match_id}`);
      });
    } catch (error) {
      console.error('Error joining match rooms:', error);
    }
  }
  
  return io;
}

module.exports = setupSocket;