var express = require('express');
var router = express.Router();
const { multiChat } = require('../services/gemini/multiChat');
const {toolChat} = require("../services/gemini/tool");
const {ragChat} = require("../services/gemini/rag");
const {authenticateToken} = require("../middleware/auth");
const MySQLDatabaseService = require('../services/mysql-database');

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { messages, roomId } = req.body;
    console.log('Chat request:', { messages, roomId, userId: req.user?.userId });
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User authentication failed' });
    }

    const userId = req.user.userId;
    
    // roomId가 제공된 경우에만 메시지 저장
    if (roomId) {
      // 채팅방 존재 여부 확인
      const chatRoom = await MySQLDatabaseService.getChatRoomById(roomId);
      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      // 사용자의 최신 메시지 저장 (messages 배열의 마지막 메시지)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'user' && lastMessage.text) {
        try {
          await MySQLDatabaseService.createMessage({
            content: lastMessage.text,
            chatRoomId: roomId,
            senderId: userId,
            messageType: 'text'
          });
          console.log('User message saved to database');
        } catch (saveError) {
          console.error('Failed to save user message:', saveError);
          // 저장 실패해도 AI 호출은 계속 진행
        }
      }
    }
    
    const result = await multiChat(messages);
    console.log('AI response:', result);

    // roomId가 제공된 경우 AI 응답을 먼저 DB에 저장
    if (roomId && result && result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      try {
        await MySQLDatabaseService.createMessage({
          content: result.candidates[0].content.parts[0].text,
          chatRoomId: roomId,
          senderId: userId, // AI 응답도 현재 사용자 ID로 저장 (나중에 시스템 사용자로 변경 가능)
          messageType: 'model',
          metadata: JSON.stringify({ aiResponse: true, chatType: 'basic' })
        });
        console.log('AI response saved to database before sending response');
      } catch (saveError) {
        console.error('Failed to save AI response:', saveError);
        // 저장 실패해도 응답은 반환
      }
    }
    
    // AI 응답을 DB에 저장한 후 클라이언트에 전송
    res.json(result);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/chat/tool', authenticateToken, async (req, res) => {
  try {
    const { messages, roomId } = req.body;
    console.log('Tool chat request:', { messages, roomId, userId: req.user?.userId });
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User authentication failed' });
    }

    const userId = req.user.userId;
    
    // roomId가 제공된 경우에만 메시지 저장
    if (roomId) {
      // 채팅방 존재 여부 확인
      const chatRoom = await MySQLDatabaseService.getChatRoomById(roomId);
      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      // 사용자의 최신 메시지 저장
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'user' && lastMessage.text) {
        try {
          await MySQLDatabaseService.createMessage({
            content: lastMessage.text,
            chatRoomId: roomId,
            senderId: userId,
            messageType: 'text'
          });
          console.log('User message saved to database');
        } catch (saveError) {
          console.error('Failed to save user message:', saveError);
        }
      }
    }

    const result = await toolChat(messages);
    console.log('Tool AI response:', result);

    // roomId가 제공된 경우 AI 응답을 먼저 DB에 저장
    if (roomId && result && result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      try {
        await MySQLDatabaseService.createMessage({
          content: result.candidates[0].content.parts[0].text,
          chatRoomId: roomId,
          senderId: userId,
          messageType: 'model',
          metadata: JSON.stringify({ aiResponse: true, chatType: 'tool' })
        });
        console.log('Tool AI response saved to database before sending response');
      } catch (saveError) {
        console.error('Failed to save tool AI response:', saveError);
      }
    }

    // AI 응답을 DB에 저장한 후 클라이언트에 전송
    res.json(result);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/chat/rag', authenticateToken, async (req, res) => {
  try {
    const { messages, roomId } = req.body;
    console.log('RAG chat request:', { messages, roomId, userId: req.user?.userId });
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User authentication failed' });
    }

    const userId = req.user.userId;
    
    // roomId가 제공된 경우에만 메시지 저장
    if (roomId) {
      // 채팅방 존재 여부 확인
      const chatRoom = await MySQLDatabaseService.getChatRoomById(roomId);
      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      // 사용자의 최신 메시지 저장
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'user' && lastMessage.text) {
        try {
          await MySQLDatabaseService.createMessage({
            content: lastMessage.text,
            chatRoomId: roomId,
            senderId: userId,
            messageType: 'text'
          });
          console.log('User message saved to database');
        } catch (saveError) {
          console.error('Failed to save user message:', saveError);
        }
      }
    }

    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required for RAG chat' });
    }
    
    const result = await ragChat(roomId);
    console.log('RAG AI response:', result);

    // roomId가 제공된 경우 AI 응답을 먼저 DB에 저장
    if (roomId && result && result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      try {
        await MySQLDatabaseService.createMessage({
          content: result.candidates[0].content.parts[0].text,
          chatRoomId: roomId,
          senderId: userId,
          messageType: 'model',
          metadata: JSON.stringify({ aiResponse: true, chatType: 'rag' })
        });
        console.log('RAG AI response saved to database before sending response');
      } catch (saveError) {
        console.error('Failed to save RAG AI response:', saveError);
      }
    }

    // AI 응답을 DB에 저장한 후 클라이언트에 전송
    res.json(result);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

module.exports = router;