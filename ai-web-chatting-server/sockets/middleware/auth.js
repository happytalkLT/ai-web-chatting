const { getRepository } = require('../../config/db-connect');
const jwtUtil = require('../../utils/jwt');

const authenticateSocketToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token using jwtUtil for consistency
    console.log('Verifying token for Socket.io connection');
    const decoded = jwtUtil.verifyAccessToken(token);
    
    // Check if token exists in whitelist
    const tokenRepository = getRepository('Token');
    const tokenRecord = await tokenRepository.findOne({
      where: {
        accessToken: token,
        isActive: true
      }
    });

    if (!tokenRecord) {
      return next(new Error('Invalid or expired token'));
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      // Mark token as inactive
      tokenRecord.isActive = false;
      await tokenRepository.save(tokenRecord);
      return next(new Error('Token expired'));
    }

    // Get user information
    const userRepository = getRepository('User');
    const user = await userRepository.findOne({
      where: { id: decoded.userId }
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user info to socket
    socket.userId = user.id;
    socket.user = user;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message || error);
    
    if (error.message === 'Token has expired') {
      return next(new Error('Token expired'));
    }
    
    if (error.message === 'Invalid token') {
      return next(new Error('Invalid token'));
    }
    
    if (error.message && error.message.includes('Invalid token type')) {
      return next(new Error('Invalid token type'));
    }
    
    return next(new Error(`Authentication failed: ${error.message || 'Unknown error'}`));
  }
};

module.exports = { authenticateSocketToken };