const { authenticateSocketToken } = require('./middleware/auth');
const chatHandlers = require('./handlers/chat');

module.exports = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocketToken);

  io.on('connection', (socket) => {
    console.log(`✅ New client connected: ${socket.id}, userId: ${socket.userId}`);

    // Join user to their personal room (for direct messages if needed)
    socket.join(`user-${socket.userId}`);

    // Handle room management
    socket.on('join-room', async (roomId) => {
      try {
        // Validate room access here if needed
        socket.join(`room-${roomId}`);
        socket.currentRoom = roomId;
        console.log(`User ${socket.userId} joined room ${roomId}`);
        
        socket.emit('room-joined', { roomId, success: true });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(`room-${roomId}`);
      if (socket.currentRoom === roomId) {
        socket.currentRoom = null;
      }
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // Register chat handlers
    chatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}, userId: ${socket.userId}`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });
};