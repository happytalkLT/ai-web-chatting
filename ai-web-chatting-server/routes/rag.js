const express = require('express');
const {createErrorResponse, ERROR_CODES, createSuccessResponse} = require("../constants/errorCodes");
const EmbeddingUtil = require("../utils/embedding");
const {authenticateToken} = require("../middleware/auth");
const MySQLDatabaseService = require("../services/mysql-database");
const upload = require("../middleware/upload");
const router = express.Router();

router.post('/knowledge/document', authenticateToken, async (req, res) => {
  const {content, title, category, source, knowledgeType} = req.body;
  const {userId} = req.user;
  if (!content || !title) {
    return res.status(400).json(
      createErrorResponse(ERROR_CODES.ERR5000, '내용과 제목이 필요합니다.')
    );
  }
  if (!knowledgeType) {
    return res.status(400).json(
      createErrorResponse(ERROR_CODES.ERR5001, '학습 타입이 정의되지 않았습니다.')
    );
  }

  const documentChunk = EmbeddingUtil.documentChunking(content);

  const knowledgeDocument = await MySQLDatabaseService.createKnowledge({
    content, title, category, source, knowledgeType, uploaderId: userId, chunk: documentChunk
  })
  const successResponse = createSuccessResponse(
    { knowledge: knowledgeDocument },
    '지식 생성이 완료 되었습니다.'
  );

  res.status(201).json(successResponse);
})

// 파일 업로드를 통한 지식 생성 엔드포인트
router.post('/knowledge/document/file', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, category, source, knowledgeType } = req.body;
    const { userId } = req.user;
    
    // 파일이 업로드되지 않은 경우
    if (!req.file) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.ERR5000, '파일이 업로드되지 않았습니다.')
      );
    }
    
    // 파일 내용을 UTF-8로 읽기
    const content = req.file.buffer.toString('utf-8');
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.ERR5000, '파일 내용이 비어있습니다.')
      );
    }
    
    // 제목이 없으면 파일명 사용 (확장자 제거)
    const documentTitle = title || req.file.originalname.replace('.txt', '');
    
    // documentChunking 함수 사용
    const documentChunk = EmbeddingUtil.documentChunking(content);
    
    // 지식 문서 생성
    const knowledgeDocument = await MySQLDatabaseService.createKnowledge({
      content,
      title: documentTitle,
      category: category || 'file',
      source: source || 'file_upload',
      knowledgeType: knowledgeType || 'text',
      uploaderId: userId,
      chunk: documentChunk
    });
    
    const successResponse = createSuccessResponse(
      { 
        knowledge: knowledgeDocument,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        chunkCount: documentChunk.length
      },
      '파일 업로드를 통한 지식 생성이 완료되었습니다.'
    );
    
    res.status(201).json(successResponse);
  } catch (error) {
    console.error('Error processing file upload:', error);
    
    // Multer 에러 처리
    if (error.message && error.message.includes('텍스트 파일')) {
      return res.status(400).json(
        createErrorResponse(ERROR_CODES.ERR5000, error.message)
      );
    }
    
    return res.status(500).json(
      createErrorResponse(ERROR_CODES.ERR5000, '파일 처리 중 오류가 발생했습니다.')
    );
  }
});

module.exports = router;
