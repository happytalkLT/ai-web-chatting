const express = require('express');
const router = express.Router();
const QdrantService = require('../services/qdrant-service');
const EmbeddingUtil = require('../utils/embedding');
const { authenticateToken } = require('../middleware/auth');
const { createSuccessResponse, createErrorResponse, ERROR_CODES } = require('../constants/errorCodes');

/**
 * POST /vector/store-message
 * 채팅 메시지를 벡터 DB에 저장
 */
router.post('/store-message', authenticateToken, async (req, res) => {
  try {
    const { message, roomId } = req.body;
    const userId = req.user.userId;

    if (!message) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.ERR1001, '메시지가 필요합니다.')
      );
    }

    // 메시지를 임베딩으로 변환
    const embedding = await EmbeddingUtil.createEmbedding(message);
    
    // 벡터 DB에 저장
    const vectorId = await QdrantService.storeChatMessage(
      message,
      embedding,
      {
        userId,
        roomId,
        userName: req.user.name,
        role: 'user'
      }
    );

    const successResponse = createSuccessResponse(
      { vectorId, message: '메시지가 벡터 DB에 저장되었습니다.' },
      '벡터 저장 성공'
    );

    res.status(201).json(successResponse);
  } catch (error) {
    console.error('Store message error:', error);
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/**
 * POST /vector/search-similar
 * 유사한 메시지 검색
 */
router.post('/search-similar', authenticateToken, async (req, res) => {
  try {
    const { query, limit = 5, userOnly = false } = req.body;
    const userId = req.user.userId;

    if (!query) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.ERR1001, '검색 쿼리가 필요합니다.')
      );
    }

    // 검색 쿼리를 임베딩으로 변환
    const queryEmbedding = await EmbeddingUtil.createEmbedding(query);

    // 유사한 메시지 검색
    const results = await QdrantService.searchSimilarMessages(
      queryEmbedding,
      userOnly ? userId : null,
      limit
    );

    const successResponse = createSuccessResponse(
      { 
        query,
        results,
        count: results.length 
      },
      '유사 메시지 검색 완료'
    );

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Search similar error:', error);
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/**
 * POST /vector/search-knowledge
 * 지식 베이스에서 관련 문서 검색
 */
router.post('/search-knowledge', authenticateToken, async (req, res) => {
  try {
    const { query, category, limit = 3 } = req.body;

    if (!query) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.ERR1001, '검색 쿼리가 필요합니다.')
      );
    }

    // 검색 쿼리를 임베딩으로 변환
    const queryEmbedding = await EmbeddingUtil.createEmbedding(query, 'RETRIEVAL_DOCUMENT');

    // 관련 지식 검색
    const results = await QdrantService.searchKnowledge(
      queryEmbedding,
      category,
      limit
    );

    const successResponse = createSuccessResponse(
      { 
        query,
        results,
        count: results.length 
      },
      '지식 검색 완료'
    );

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Search knowledge error:', error);
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/**
 * GET /vector/collection-info
 * 컬렉션 정보 조회
 */
router.get('/collection-info', authenticateToken, async (req, res) => {
  try {
    const info = await QdrantService.getCollectionInfo();

    const successResponse = createSuccessResponse(
      info,
      '컬렉션 정보 조회 성공'
    );

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Get collection info error:', error);
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/**
 * POST /vector/test-embedding
 * 임베딩 테스트 (개발용)
 */
router.post('/test-embedding', async (req, res) => {
  try {
    const { text, useDummy = true } = req.body;

    if (!text) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.ERR1001, '텍스트가 필요합니다.')
      );
    }

    let embedding;
    if (useDummy) {
      // 테스트용 더미 임베딩 사용
      embedding = EmbeddingUtil.createDummyEmbedding(text);
    } else {
      // 실제 임베딩 생성 (Gemini)
      embedding = await EmbeddingUtil.createEmbedding(text);
    }

    const successResponse = createSuccessResponse(
      { 
        text,
        embeddingSize: embedding.length,
        embedding: embedding.slice(0, 10), // 처음 10개 값만 표시
        isDummy: useDummy
      },
      '임베딩 생성 완료'
    );

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Test embedding error:', error);
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

module.exports = router;