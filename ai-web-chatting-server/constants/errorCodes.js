// 에러 코드 상수 정의
const ERROR_CODES = {
  // 공통 에러 (ERR0000-ERR0099)
  ERR0000: 'ERR0000', // 일반 서버 오류
  ERR0001: 'ERR0001', // 알 수 없는 오류
  ERR0002: 'ERR0002', // 요청 처리 실패

  // 인증 관련 에러 (ERR1000-ERR1099)
  ERR1000: 'ERR1000', // 필수 필드 누락
  ERR1001: 'ERR1001', // 이메일 형식 오류
  ERR1002: 'ERR1002', // 비밀번호 길이 부족
  ERR1003: 'ERR1003', // 비밀번호 강도 부족
  ERR1004: 'ERR1004', // 이름 길이 오류
  ERR1005: 'ERR1005', // 이메일 중복
  ERR1006: 'ERR1006', // 사용자를 찾을 수 없음
  ERR1007: 'ERR1007', // 비밀번호 불일치
  ERR1008: 'ERR1008', // 토큰 오류
  ERR1009: 'ERR1009', // 권한 없음

  // 사용자 관련 에러 (ERR2000-ERR2099)
  ERR2000: 'ERR2000', // 사용자 ID 형식 오류
  ERR2001: 'ERR2001', // 사용자 정보 업데이트 실패
  ERR2002: 'ERR2002', // 사용자 삭제 실패

  // 채팅 관련 에러 (ERR3000-ERR3099)
  ERR3000: 'ERR3000', // 채팅방 생성 실패
  ERR3001: 'ERR3001', // 채팅방을 찾을 수 없음
  ERR3002: 'ERR3002', // 메시지 전송 실패
  ERR3003: 'ERR3003', // 메시지를 찾을 수 없음

  // 파일 관련 에러 (ERR4000-ERR4099)
  ERR4000: 'ERR4000', // 파일 업로드 실패
  ERR4001: 'ERR4001', // 파일 형식 오류
  ERR4002: 'ERR4002', // 파일 크기 초과

  //지식 학습 에러
  ERR5000: 'ERR5000', // 필수 필드 누락
  ERR5001: 'ERR5001', // 지식 학습 타입 오류


};

// 에러 메시지 매핑
const ERROR_MESSAGES = {
  // 공통 에러
  [ERROR_CODES.ERR0000]: '서버 오류가 발생했습니다.',
  [ERROR_CODES.ERR0001]: '알 수 없는 오류가 발생했습니다.',
  [ERROR_CODES.ERR0002]: '요청 처리에 실패했습니다.',

  // 인증 관련 에러
  [ERROR_CODES.ERR1000]: '필수 필드를 모두 입력해주세요.',
  [ERROR_CODES.ERR1001]: '올바른 이메일 형식을 입력해주세요.',
  [ERROR_CODES.ERR1002]: '비밀번호는 6자 이상이어야 합니다.',
  [ERROR_CODES.ERR1003]: '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
  [ERROR_CODES.ERR1004]: '이름은 2자 이상 50자 이하여야 합니다.',
  [ERROR_CODES.ERR1005]: '이미 존재하는 이메일입니다.',
  [ERROR_CODES.ERR1006]: '사용자를 찾을 수 없습니다.',
  [ERROR_CODES.ERR1007]: '이메일 또는 비밀번호가 일치하지 않습니다.',
  [ERROR_CODES.ERR1008]: '유효하지 않은 토큰입니다.',
  [ERROR_CODES.ERR1009]: '접근 권한이 없습니다.',

  // 사용자 관련 에러
  [ERROR_CODES.ERR2000]: '올바른 사용자 ID 형식이 아닙니다.',
  [ERROR_CODES.ERR2001]: '사용자 정보 업데이트에 실패했습니다.',
  [ERROR_CODES.ERR2002]: '사용자 삭제에 실패했습니다.',

  // 채팅 관련 에러
  [ERROR_CODES.ERR3000]: '채팅방 생성에 실패했습니다.',
  [ERROR_CODES.ERR3001]: '채팅방을 찾을 수 없습니다.',
  [ERROR_CODES.ERR3002]: '메시지 전송에 실패했습니다.',
  [ERROR_CODES.ERR3003]: '메시지를 찾을 수 없습니다.',

  // 파일 관련 에러
  [ERROR_CODES.ERR4000]: '파일 업로드에 실패했습니다.',
  [ERROR_CODES.ERR4001]: '지원하지 않는 파일 형식입니다.',
  [ERROR_CODES.ERR4002]: '파일 크기가 너무 큽니다.',
};

// HTTP 상태 코드 매핑
const ERROR_STATUS_CODES = {
  // 공통 에러
  [ERROR_CODES.ERR0000]: 500,
  [ERROR_CODES.ERR0001]: 500,
  [ERROR_CODES.ERR0002]: 500,

  // 인증 관련 에러
  [ERROR_CODES.ERR1000]: 400,
  [ERROR_CODES.ERR1001]: 400,
  [ERROR_CODES.ERR1002]: 400,
  [ERROR_CODES.ERR1003]: 400,
  [ERROR_CODES.ERR1004]: 400,
  [ERROR_CODES.ERR1005]: 409,
  [ERROR_CODES.ERR1006]: 404,
  [ERROR_CODES.ERR1007]: 401,
  [ERROR_CODES.ERR1008]: 401,
  [ERROR_CODES.ERR1009]: 403,

  // 사용자 관련 에러
  [ERROR_CODES.ERR2000]: 400,
  [ERROR_CODES.ERR2001]: 500,
  [ERROR_CODES.ERR2002]: 500,

  // 채팅 관련 에러
  [ERROR_CODES.ERR3000]: 500,
  [ERROR_CODES.ERR3001]: 404,
  [ERROR_CODES.ERR3002]: 500,
  [ERROR_CODES.ERR3003]: 404,

  // 파일 관련 에러
  [ERROR_CODES.ERR4000]: 500,
  [ERROR_CODES.ERR4001]: 400,
  [ERROR_CODES.ERR4002]: 413,
};

// 에러 응답 생성 헬퍼 함수
const createErrorResponse = (errorCode, customMessage = null) => {
  return {
    success: false,
    errorCode,
    message: customMessage || ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[ERROR_CODES.ERR0001],
    statusCode: ERROR_STATUS_CODES[errorCode] || 500
  };
};

// 성공 응답 생성 헬퍼 함수
const createSuccessResponse = (data = null, message = '요청이 성공적으로 처리되었습니다.') => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return response;
};

module.exports = {
  ERROR_CODES,
  ERROR_MESSAGES,
  ERROR_STATUS_CODES,
  createErrorResponse,
  createSuccessResponse
};