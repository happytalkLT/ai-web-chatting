var express = require('express');
var router = express.Router();

const {authenticateToken} = require("../middleware/auth");
const MySQLDatabaseService = require('../services/mysql-database');
const {createSuccessResponse} = require("../constants/errorCodes");

router.post('/', authenticateToken, async (req, res) => {
  try {
    const {name, description, type = 'public'} = req.body;
    
    if (!req.user || !req.user.userId) {
      console.log('Auth failed - req.user:', req.user);
      return res.status(401).json({error: 'User authentication failed'});
    }
    
    const createdBy = req.user.userId;
    console.log('Creating room with createdBy:', createdBy);

    const chatRoom = await MySQLDatabaseService.createChatRoom({name, description, type, createdBy});
    const successResponse = createSuccessResponse(
      { room: chatRoom },
      '채팅 방이 생성 되었습니다.'
    );

    res.status(201).json(successResponse);
  } catch (e) {
    console.log('Create Room Error:', e.message);
    res.status(500).json({error: e.message});
  }
})

router.get('/', authenticateToken, async (req, res) => {
  try {
    const chatRooms = await MySQLDatabaseService.getChatRooms();
    const successResponse = createSuccessResponse(
      { rooms: chatRooms },
      '요청이 성공적으로 처리되었습니다.'
    );

    res.status(200).json(successResponse);
  } catch (e) {
    console.log('Get Rooms Error:', e.message);
    res.status(500).json({error: e.message});
  }
})

// 채팅방별 메시지 조회
router.get('/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    if (!req.user || !req.user.userId) {
      console.log('Auth failed - req.user:', req.user);
      return res.status(401).json({error: 'User authentication failed'});
    }
    
    console.log(`Getting messages for room ${roomId}, limit: ${limit}, offset: ${offset}`);
    
    // 채팅방 존재 여부 확인
    const chatRoom = await MySQLDatabaseService.getChatRoomById(roomId);
    if (!chatRoom) {
      return res.status(404).json({error: 'Chat room not found'});
    }
    
    const messages = await MySQLDatabaseService.getMessagesByRoom(
      roomId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    const successResponse = createSuccessResponse(
      { messages },
      '메시지 조회가 성공적으로 완료되었습니다.'
    );

    res.status(200).json(successResponse);
  } catch (e) {
    console.log('Get Messages Error:', e.message);
    res.status(500).json({error: e.message});
  }
});

module.exports = router;