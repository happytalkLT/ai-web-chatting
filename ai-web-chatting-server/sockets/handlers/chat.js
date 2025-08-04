const { multiChat } = require('../../services/gemini/multiChat');
const { toolChat } = require('../../services/gemini/tool');
const { ragChat } = require('../../services/gemini/rag');
const MySQLDatabaseService = require('../../services/mysql-database');

module.exports = (io, socket) => {
  // Handle basic chat messages
  socket.on('chat-message', async (data) => {
    try {
      const { messages, roomId } = data;
      console.log('Chat message received:', { roomId, userId: socket.userId, messageCount: messages?.length });

      if (!messages || !Array.isArray(messages)) {
        socket.emit('error', { message: 'messages array is required' });
        return;
      }

      if (!roomId) {
        socket.emit('error', { message: 'roomId is required' });
        return;
      }

      // Verify room exists
      const chatRoom = await MySQLDatabaseService.getChatRoomById(roomId);
      if (!chatRoom) {
        socket.emit('error', { message: 'Chat room not found' });
        return;
      }

      // Save user's message
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'user' && lastMessage.text) {
        try {
          await MySQLDatabaseService.createMessage({
            content: lastMessage.text,
            chatRoomId: roomId,
            senderId: socket.userId,
            messageType: 'text'
          });
          console.log('User message saved to database');
        } catch (saveError) {
          console.error('Failed to save user message:', saveError);
        }
      }

      // Call AI service
      const result = await multiChat(messages);
      console.log('AI response received');

      // Save AI response
      if (result && result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        try {
          const aiMessage = await MySQLDatabaseService.createMessage({
            content: result.candidates[0].content.parts[0].text,
            chatRoomId: roomId,
            senderId: socket.userId,
            messageType: 'model',
            metadata: JSON.stringify({ aiResponse: true, chatType: 'basic' })
          });
          console.log('AI response saved to database');

          // Emit response to the sender
          socket.emit('chat-response', {
            roomId,
            response: result,
            messageId: aiMessage.id
          });

          // Broadcast to other users in the room
          socket.to(`room-${roomId}`).emit('new-message', {
            roomId,
            message: {
              id: aiMessage.id,
              content: aiMessage.content,
              messageType: aiMessage.messageType,
              senderId: aiMessage.senderId,
              createdAt: aiMessage.createdAt
            }
          });
        } catch (saveError) {
          console.error('Failed to save AI response:', saveError);
          socket.emit('chat-response', { roomId, response: result });
        }
      }
    } catch (error) {
      console.error('Error in chat-message handler:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Handle tool chat messages
  socket.on('chat-tool-message', async (data) => {
    try {
      const { messages, roomId } = data;
      console.log('Tool chat message received:', { roomId, userId: socket.userId });

      if (!messages || !Array.isArray(messages)) {
        socket.emit('error', { message: 'messages array is required' });
        return;
      }

      if (!roomId) {
        socket.emit('error', { message: 'roomId is required' });
        return;
      }

      // Verify room exists
      const chatRoom = await MySQLDatabaseService.getChatRoomById(roomId);
      if (!chatRoom) {
        socket.emit('error', { message: 'Chat room not found' });
        return;
      }

      // Save user's message
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'user' && lastMessage.text) {
        try {
          await MySQLDatabaseService.createMessage({
            content: lastMessage.text,
            chatRoomId: roomId,
            senderId: socket.userId,
            messageType: 'text'
          });
          console.log('User message saved to database');
        } catch (saveError) {
          console.error('Failed to save user message:', saveError);
        }
      }

      // Call AI service with tools
      const result = await toolChat(messages);
      console.log('Tool AI response received');

      // Save AI response
      if (result && result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        try {
          const aiMessage = await MySQLDatabaseService.createMessage({
            content: result.candidates[0].content.parts[0].text,
            chatRoomId: roomId,
            senderId: socket.userId,
            messageType: 'model',
            metadata: JSON.stringify({ aiResponse: true, chatType: 'tool' })
          });
          console.log('Tool AI response saved to database');

          // Emit response
          socket.emit('chat-response', {
            roomId,
            response: result,
            messageId: aiMessage.id
          });

          // Broadcast to others
          socket.to(`room-${roomId}`).emit('new-message', {
            roomId,
            message: {
              id: aiMessage.id,
              content: aiMessage.content,
              messageType: aiMessage.messageType,
              senderId: aiMessage.senderId,
              createdAt: aiMessage.createdAt
            }
          });
        } catch (saveError) {
          console.error('Failed to save tool AI response:', saveError);
          socket.emit('chat-response', { roomId, response: result });
        }
      }
    } catch (error) {
      console.error('Error in chat-tool-message handler:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Handle RAG chat messages
  socket.on('chat-rag-message', async (data) => {
    try {
      const { messages, roomId } = data;
      console.log('RAG chat message received:', { roomId, userId: socket.userId });

      if (!messages || !Array.isArray(messages)) {
        socket.emit('error', { message: 'messages array is required' });
        return;
      }

      if (!roomId) {
        socket.emit('error', { message: 'roomId is required for RAG chat' });
        return;
      }

      // Verify room exists
      const chatRoom = await MySQLDatabaseService.getChatRoomById(roomId);
      if (!chatRoom) {
        socket.emit('error', { message: 'Chat room not found' });
        return;
      }

      // Save user's message
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'user' && lastMessage.text) {
        try {
          await MySQLDatabaseService.createMessage({
            content: lastMessage.text,
            chatRoomId: roomId,
            senderId: socket.userId,
            messageType: 'text'
          });
          console.log('User message saved to database');
        } catch (saveError) {
          console.error('Failed to save user message:', saveError);
        }
      }

      // Call RAG service
      const result = await ragChat(roomId);
      console.log('RAG AI response received');

      // Save AI response
      if (result && result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        try {
          const aiMessage = await MySQLDatabaseService.createMessage({
            content: result.candidates[0].content.parts[0].text,
            chatRoomId: roomId,
            senderId: socket.userId,
            messageType: 'model',
            metadata: JSON.stringify({ aiResponse: true, chatType: 'rag' })
          });
          console.log('RAG AI response saved to database');

          // Emit response
          socket.emit('chat-response', {
            roomId,
            response: result,
            messageId: aiMessage.id
          });

          // Broadcast to others
          socket.to(`room-${roomId}`).emit('new-message', {
            roomId,
            message: {
              id: aiMessage.id,
              content: aiMessage.content,
              messageType: aiMessage.messageType,
              senderId: aiMessage.senderId,
              createdAt: aiMessage.createdAt
            }
          });
        } catch (saveError) {
          console.error('Failed to save RAG AI response:', saveError);
          socket.emit('chat-response', { roomId, response: result });
        }
      }
    } catch (error) {
      console.error('Error in chat-rag-message handler:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });
};