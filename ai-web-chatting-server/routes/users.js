var express = require('express');
var router = express.Router();
const MySQLDatabaseService = require('../services/mysql-database');
const { validateSignup, validateLogin, validateUserId, validateUserUpdate } = require('../middleware/validation');
const { ERROR_CODES, createErrorResponse, createSuccessResponse } = require('../constants/errorCodes');
const jwtUtil = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');

router.post('/signup', validateSignup, async (req, res) => {
  try {
    // 검증된 데이터 사용
    const { email, name, password } = req.validatedData;

    // 사용자 생성 (비밀번호 자동 암호화됨)
    const newUser = await MySQLDatabaseService.createUser({
      email,
      name,
      password
    });

    // 응답에서 비밀번호 제거
    const { password: _, ...userResponse } = newUser;

    const successResponse = createSuccessResponse(
      { user: userResponse },
      '회원가입이 완료되었습니다.'
    );
    
    res.status(201).json(successResponse);

  } catch (error) {
    console.error('회원가입 에러:', error);
    
    // MySQL 중복 키 에러 처리
    if (error.code === 'ER_DUP_ENTRY') {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1005);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    // 검증된 데이터 사용
    const { email, password } = req.validatedData;

    // 사용자 조회
    const user = await MySQLDatabaseService.getUserByEmail(email);
    if (!user) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1007);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 비밀번호 검증
    const isPasswordValid = MySQLDatabaseService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1007);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 마지막 로그인 시간 업데이트
    await MySQLDatabaseService.updateUser(user.id, {
      lastLoginAt: new Date()
    });

    // JWT 토큰 생성
    const { accessToken, refreshToken, expiresAt } = jwtUtil.generateTokenPair(user);
    
    // 토큰을 화이트리스트에 저장
    await MySQLDatabaseService.createToken({
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt
    });

    // 응답에서 비밀번호 제거
    const { password: _, ...userResponse } = user;

    const successResponse = createSuccessResponse(
      { 
        user: userResponse,
        accessToken,
        refreshToken
      },
      '로그인이 완료되었습니다.'
    );
    
    res.status(200).json(successResponse);

  } catch (error) {
    console.error('로그인 에러:', error);
    
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/* POST 토큰 갱신 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1008);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 기존 refresh token이 화이트리스트에 있는지 확인
    const tokenRecord = await MySQLDatabaseService.findActiveRefreshToken(refreshToken);
    if (!tokenRecord) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1008, '유효하지 않은 리프레시 토큰입니다.');
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    
    // 토큰 갱신
    const tokens = await jwtUtil.refreshAccessToken(refreshToken);
    
    // 기존 토큰 비활성화
    await MySQLDatabaseService.invalidateToken(tokenRecord.id);
    
    // 새 토큰을 화이트리스트에 저장
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 5); // 5시간 후
    
    await MySQLDatabaseService.createToken({
      userId: tokenRecord.userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt
    });

    const successResponse = createSuccessResponse(
      tokens,
      '토큰이 갱신되었습니다.'
    );
    
    res.status(200).json(successResponse);

  } catch (error) {
    console.error('토큰 갱신 에러:', error);
    
    const errorResponse = createErrorResponse(ERROR_CODES.ERR1008);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/* GET 현재 사용자 정보 (토큰 검증) */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // 미들웨어에서 검증된 사용자 정보 사용
    const user = await MySQLDatabaseService.getUserById(req.user.userId);
    if (!user) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1006);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 응답에서 비밀번호 제거
    const { password: _, ...userResponse } = user;

    const successResponse = createSuccessResponse(
      { user: userResponse },
      '사용자 정보를 조회했습니다.'
    );
    
    res.status(200).json(successResponse);

  } catch (error) {
    console.error('사용자 조회 에러:', error);
    
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/* POST 로그아웃 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // 현재 토큰 비활성화
    if (req.tokenId) {
      await MySQLDatabaseService.invalidateToken(req.tokenId);
    }
    
    const successResponse = createSuccessResponse(
      null,
      '로그아웃이 완료되었습니다.'
    );
    
    res.status(200).json(successResponse);

  } catch (error) {
    console.error('로그아웃 에러:', error);
    
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/* PUT 사용자 정보 수정 */
router.put('/profile', authenticateToken, validateUserUpdate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.validatedData;

    // 사용자 정보 업데이트
    const updatedUser = await MySQLDatabaseService.updateUser(userId, updateData);
    
    if (!updatedUser) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR2001);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 응답에서 비밀번호 제거
    const { password: _, ...userResponse } = updatedUser;

    const successResponse = createSuccessResponse(
      { user: userResponse },
      '사용자 정보가 수정되었습니다.'
    );
    
    res.status(200).json(successResponse);

  } catch (error) {
    console.error('사용자 정보 수정 에러:', error);
    
    const errorResponse = createErrorResponse(ERROR_CODES.ERR2001);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/* DELETE 회원 탈퇴 */
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 사용자 삭제
    const deleted = await MySQLDatabaseService.deleteUser(userId);
    
    if (!deleted) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR2002);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const successResponse = createSuccessResponse(
      null,
      '회원 탈퇴가 완료되었습니다.'
    );
    
    res.status(200).json(successResponse);

  } catch (error) {
    console.error('회원 탈퇴 에러:', error);
    
    const errorResponse = createErrorResponse(ERROR_CODES.ERR2002);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

module.exports = router;
