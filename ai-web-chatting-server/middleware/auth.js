const jwtUtil = require('../utils/jwt');
const { ERROR_CODES, createErrorResponse } = require('../constants/errorCodes');
const MySQLDatabaseService = require('../services/mysql-database');

/**
 * JWT 토큰 인증 미들웨어
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1008, '인증 토큰이 필요합니다.');
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const token = authHeader.split(' ')[1];

    // 토큰 검증 (JWT 서명 검증)
    const decoded = jwtUtil.verifyAccessToken(token);
    
    // 화이트리스트 검증
    const tokenRecord = await MySQLDatabaseService.findActiveToken(token);
    if (!tokenRecord) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1008, '유효하지 않은 토큰입니다.');
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    
    // 검증된 사용자 정보를 request 객체에 추가
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };
    req.tokenId = tokenRecord.id; // 토큰 ID도 추가 (로그아웃 시 사용)

    next();
  } catch (error) {
    console.error('인증 에러:', error);
    
    if (error.message === 'Token has expired') {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1008, '토큰이 만료되었습니다.');
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    
    if (error.message === 'Invalid token') {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1008, '유효하지 않은 토큰입니다.');
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    
    const errorResponse = createErrorResponse(ERROR_CODES.ERR1008);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwtUtil.verifyAccessToken(token);
        
        // 화이트리스트 검증
        const tokenRecord = await MySQLDatabaseService.findActiveToken(token);
        if (tokenRecord) {
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            name: decoded.name
          };
          req.tokenId = tokenRecord.id;
        }
      } catch (error) {
        // 토큰이 유효하지 않아도 통과 (선택적 인증)
        console.log('Optional auth: Invalid token, proceeding without user');
      }
    }
    
    next();
  } catch (error) {
    console.error('선택적 인증 에러:', error);
    next();
  }
};

/**
 * 특정 역할 확인 미들웨어 (예: 관리자)
 * @param {Array<string>} allowedRoles - 허용된 역할 목록
 * @returns {Function} - Express middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1009);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 역할 확인 로직 (현재는 간단히 구현)
    // 실제로는 데이터베이스에서 사용자 역할을 확인해야 함
    const userRole = req.user.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1009, '접근 권한이 없습니다.');
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
};