const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const swipeRoutes = require('./routes/swipeRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Setup Socket.IO
const setupSocket = require('./utils/socket');
const io = setupSocket(server);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/swipes', swipeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});