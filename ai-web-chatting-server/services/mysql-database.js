const { getRepository } = require('../config/db-connect');
const { In } = require('typeorm');
const User = require('../entities/User');
const ChatRoom = require('../entities/ChatRoom');
const ChatMessage = require('../entities/ChatMessage');
const ChatParticipant = require('../entities/ChatParticipant');
const Token = require('../entities/Token');
const Knowledge = require('../entities/Knowledge');
const cryptoUtil = require('../utils/crypto');
const ChatSummary = require("../entities/ChatSummary");

class MySQLDatabaseService {
  // User 관련 메서드
  static async createUser(userData) {
    try {
      const userRepository = getRepository(User);
      
      // 비밀번호 해싱 (crypto 모듈 사용)
      const hashedPassword = cryptoUtil.hashPassword(userData.password);
      
      const user = userRepository.create({
        ...userData,
        password: hashedPassword
      });
      
      return await userRepository.save(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      const userRepository = getRepository(User);
      return await userRepository.findOne({ where: { id } });
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  static async getUserByEmail(email) {
    try {
      const userRepository = getRepository(User);
      return await userRepository.findOne({ where: { email } });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  static async updateUser(id, userData) {
    try {
      const userRepository = getRepository(User);
      
      if (userData.password) {
        userData.password = cryptoUtil.hashPassword(userData.password);
      }
      
      await userRepository.update(id, userData);
      return await userRepository.findOne({ where: { id } });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const userRepository = getRepository(User);
      const result = await userRepository.delete(id);
      return result.affected > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // ChatRoom 관련 메서드
  static async createChatRoom(roomData) {
    try {
      const chatRoomRepository = getRepository(ChatRoom);
      const chatRoom = chatRoomRepository.create(roomData);
      return await chatRoomRepository.save(chatRoom);
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  static async getChatRoomById(id) {
    try {
      const chatRoomRepository = getRepository(ChatRoom);
      return await chatRoomRepository.findOne({
        where: { id },
        relations: ['creator', 'participants', 'participants.user']
      });
    } catch (error) {
      console.error('Error fetching chat room:', error);
      throw error;
    }
  }

  static async getChatRooms() {
    try {
      const chatRoomRepository = getRepository(ChatRoom);
      return await chatRoomRepository.find({
        where: { isActive: true },
        relations: ['creator', 'participants', 'participants.user']
      });
    } catch (error) {
      console.error('Error fetching chat room:', error);
      throw error;
    }
  }

  static async getChatRoomsByUser(userId) {
    try {
      const chatParticipantRepository = getRepository(ChatParticipant);
      return await chatParticipantRepository.find({
        where: { userId, isActive: true },
        relations: ['chatRoom', 'chatRoom.creator']
      });
    } catch (error) {
      console.error('Error fetching user chat rooms:', error);
      throw error;
    }
  }

  // ChatMessage 관련 메서드
  static async createMessage(messageData) {
    try {
      const messageRepository = getRepository(ChatMessage);
      const message = messageRepository.create(messageData);
      return await messageRepository.save(message);
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async getMessagesByRoom(chatRoomId, limit = 50, offset = 0) {
    try {
      const messageRepository = getRepository(ChatMessage);
      return await messageRepository.find({
        where: { chatRoomId, isDeleted: false },
        relations: ['sender', 'replyTo', 'replyTo.sender'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
  static async getNotSummaryMessagesByRoom(chatRoomId, limit = 50, offset = 0) {
    try {
      const messageRepository = getRepository(ChatMessage);
      
      // isSummary가 false인 메시지들을 조회
      const messages = await messageRepository.find({
        where: { chatRoomId, isDeleted: false, isSummary: false },
        relations: ['sender', 'replyTo', 'replyTo.sender'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset
      });
      
      // 조회된 메시지들의 ID를 추출
      const messageIds = messages.map(message => message.id);
      
      // 반환된 데이터 수가 50이 되는 경우에만 isSummary: true로 업데이트
      if (messageIds.length === 50) {
        await messageRepository.update(
          { id: In(messageIds) },
          { isSummary: true }
        );
      }
      
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async updateMessage(id, updateData) {
    try {
      const messageRepository = getRepository(ChatMessage);
      await messageRepository.update(id, {
        ...updateData,
        isEdited: true,
        editedAt: new Date()
      });
      return await messageRepository.findOne({ where: { id } });
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  static async deleteMessage(id) {
    try {
      const messageRepository = getRepository(ChatMessage);
      await messageRepository.update(id, {
        isDeleted: true,
        deletedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  static async createChatSummary(chatSummaryData) {
    const chatSummaryRepository = getRepository(ChatSummary);
    const chatSummary = chatSummaryRepository.create(chatSummaryData);
    return await chatSummaryRepository.save(chatSummary);
  }

  // ChatParticipant 관련 메서드
  static async addParticipant(participantData) {
    try {
      const participantRepository = getRepository(ChatParticipant);
      const participant = participantRepository.create(participantData);
      return await participantRepository.save(participant);
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  static async removeParticipant(chatRoomId, userId) {
    try {
      const participantRepository = getRepository(ChatParticipant);
      await participantRepository.update(
        { chatRoomId, userId },
        { isActive: false, leftAt: new Date() }
      );
      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  static async updateLastReadAt(chatRoomId, userId) {
    try {
      const participantRepository = getRepository(ChatParticipant);
      await participantRepository.update(
        { chatRoomId, userId },
        { lastReadAt: new Date() }
      );
      return true;
    } catch (error) {
      console.error('Error updating last read:', error);
      throw error;
    }
  }

  // 비밀번호 검증
  static verifyPassword(plainPassword, hashedPassword) {
    try {
      return cryptoUtil.verifyPassword(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  // Token 관련 메서드
  static async createToken(tokenData) {
    try {
      const tokenRepository = getRepository(Token);
      
      // 해당 사용자의 기존 활성 토큰 모두 비활성화
      await tokenRepository.update(
        { userId: tokenData.userId, isActive: true },
        { isActive: false }
      );
      
      const token = tokenRepository.create(tokenData);
      return await tokenRepository.save(token);
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }

  static async findActiveToken(accessToken) {
    try {
      const tokenRepository = getRepository(Token);
      return await tokenRepository.findOne({
        where: { accessToken, isActive: true },
        relations: ['user']
      });
    } catch (error) {
      console.error('Error finding active token:', error);
      throw error;
    }
  }

  static async findActiveRefreshToken(refreshToken) {
    try {
      const tokenRepository = getRepository(Token);
      return await tokenRepository.findOne({
        where: { refreshToken, isActive: true },
        relations: ['user']
      });
    } catch (error) {
      console.error('Error finding active refresh token:', error);
      throw error;
    }
  }

  static async invalidateToken(tokenId) {
    try {
      const tokenRepository = getRepository(Token);
      await tokenRepository.update(tokenId, { isActive: false });
      return true;
    } catch (error) {
      console.error('Error invalidating token:', error);
      throw error;
    }
  }

  static async invalidateUserTokens(userId) {
    try {
      const tokenRepository = getRepository(Token);
      await tokenRepository.update(
        { userId, isActive: true },
        { isActive: false }
      );
      return true;
    } catch (error) {
      console.error('Error invalidating user tokens:', error);
      throw error;
    }
  }

  static async deleteExpiredTokens() {
    try {
      const tokenRepository = getRepository(Token);
      const now = new Date();
      
      // 만료된 토큰 삭제 (TypeORM의 LessThan 사용)
      const result = await tokenRepository
        .createQueryBuilder()
        .delete()
        .from(Token)
        .where('expiresAt < :now', { now })
        .execute();
      
      return result.affected || 0;
    } catch (error) {
      console.error('Error deleting expired tokens:', error);
      throw error;
    }
  }

  // Knowledge 메소드
  static async createKnowledge(knowledgeData) {
    try {
      const knowledgeRepository = getRepository(Knowledge);
      const knowledge = knowledgeRepository.create(knowledgeData);
      return await knowledgeRepository.save(knowledge);
    } catch (error) {
      console.error('Error creating knowledge:', error);
      throw error;
    }
  }
  static async findSearchedKnowledge(knowledgeId) {
    try {
      const knowledgeRepository = getRepository(Knowledge);
      const knowledge = await knowledgeRepository.findOne({where: {id: knowledgeId}});
      return knowledge;
    } catch (error) {
      console.error('Error creating knowledge:', error);
      throw error;
    }
  }
}

module.exports = MySQLDatabaseService;