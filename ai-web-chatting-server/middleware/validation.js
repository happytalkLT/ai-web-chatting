const MySQLDatabaseService = require('../services/mysql-database');
const { ERROR_CODES, createErrorResponse } = require('../constants/errorCodes');

// 회원가입 검증 미들웨어
const validateSignup = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    // 필수 필드 검증
    if (!email || !name || !password) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1000);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1001);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 이름 길이 검증
    if (name.trim().length < 2 || name.trim().length > 50) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1004);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1002);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 비밀번호 강도 검증 (선택사항)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (password.length >= 8 && !passwordRegex.test(password)) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1003);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 이메일 중복 확인
    const existingUser = await MySQLDatabaseService.getUserByEmail(email);
    if (existingUser) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1005);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 검증된 데이터를 req.validatedData에 저장
    req.validatedData = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password
    };

    next();
  } catch (error) {
    console.error('회원가입 검증 에러:', error);
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// 로그인 검증 미들웨어
const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 필수 필드 검증
    if (!email || !password) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1000);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR1001);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // 검증된 데이터를 req.validatedData에 저장
    req.validatedData = {
      email: email.toLowerCase().trim(),
      password
    };

    next();
  } catch (error) {
    console.error('로그인 검증 에러:', error);
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// 사용자 ID 검증 미들웨어
const validateUserId = (req, res, next) => {
  try {
    const { id } = req.params;

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      const errorResponse = createErrorResponse(ERROR_CODES.ERR2000);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    req.validatedData = { ...req.validatedData, id };
    next();
  } catch (error) {
    console.error('사용자 ID 검증 에러:', error);
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// 사용자 정보 업데이트 검증 미들웨어
const validateUserUpdate = (req, res, next) => {
  try {
    const { name, profileImage } = req.body;
    const validatedData = {};

    // 이름 검증 (선택사항)
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
        const errorResponse = createErrorResponse(ERROR_CODES.ERR1004);
        return res.status(errorResponse.statusCode).json(errorResponse);
      }
      validatedData.name = name.trim();
    }

    // 프로필 이미지 검증 (선택사항)
    if (profileImage !== undefined) {
      if (typeof profileImage !== 'string') {
        const errorResponse = createErrorResponse(ERROR_CODES.ERR4001);
        return res.status(errorResponse.statusCode).json(errorResponse);
      }
      validatedData.profileImage = profileImage;
    }

    req.validatedData = { ...req.validatedData, ...validatedData };
    next();
  } catch (error) {
    console.error('사용자 정보 업데이트 검증 에러:', error);
    const errorResponse = createErrorResponse(ERROR_CODES.ERR0000);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

module.exports = {
  validateSignup,
  validateLogin,
  validateUserId,
  validateUserUpdate
};