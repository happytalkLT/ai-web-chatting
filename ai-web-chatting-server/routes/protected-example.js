var express = require('express');
var router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createSuccessResponse } = require('../constants/errorCodes');

/**
 * 인증이 필요한 라우터 예시
 * 
 * 사용 방법:
 * 1. 개별 라우트에 적용: router.get('/path', authenticateToken, handler)
 * 2. 라우터 전체에 적용: router.use(authenticateToken)
 * 3. 특정 경로에만 적용: router.use('/admin/*', authenticateToken)
 */

// 옵션 1: 라우터의 모든 경로에 인증 적용
// router.use(authenticateToken);

// 옵션 2: 개별 라우트에 인증 적용
router.get('/protected', authenticateToken, (req, res) => {
  const successResponse = createSuccessResponse(
    { 
      message: '보호된 리소스에 접근했습니다.',
      user: req.user 
    },
    '인증된 사용자만 접근 가능합니다.'
  );
  
  res.status(200).json(successResponse);
});

// 옵션 3: 특정 역할이 필요한 라우트
router.get('/admin', authenticateToken, requireRole(['admin']), (req, res) => {
  const successResponse = createSuccessResponse(
    { 
      message: '관리자 페이지입니다.',
      user: req.user 
    },
    '관리자 권한이 확인되었습니다.'
  );
  
  res.status(200).json(successResponse);
});

// 옵션 4: 특정 경로 이하 모든 라우트에 인증 적용
router.use('/api/*', authenticateToken);

router.get('/api/data', (req, res) => {
  // 이 라우트는 /api/* 미들웨어로 인해 자동으로 인증이 적용됨
  const successResponse = createSuccessResponse(
    { 
      data: ['item1', 'item2', 'item3'],
      userId: req.user.userId 
    },
    '데이터를 조회했습니다.'
  );
  
  res.status(200).json(successResponse);
});

module.exports = router;