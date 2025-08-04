const jwt = require('jsonwebtoken');
const cryptoUtil = require('./crypto');

class JWTUtil {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    
    if (!this.secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    // 토큰 만료 시간 설정
    this.accessTokenExpiry = '1h';
    this.refreshTokenExpiry = '5h';
  }

  /**
   * Access Token 생성
   * @param {Object} payload - 토큰에 포함할 정보
   * @returns {string} - JWT Access Token
   */
  generateAccessToken(payload) {
    try {
      return jwt.sign(
        {
          ...payload,
          type: 'access'
        },
        this.secret,
        {
          expiresIn: this.accessTokenExpiry,
          issuer: 'ai-web-chatting',
          audience: 'ai-web-chatting-users'
        }
      );
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Refresh Token 생성
   * @param {Object} payload - 토큰에 포함할 정보
   * @returns {string} - JWT Refresh Token
   */
  generateRefreshToken(payload) {
    try {
      // Refresh token에는 최소한의 정보만 포함
      const refreshPayload = {
        userId: payload.userId,
        email: payload.email,
        type: 'refresh',
        // 추가 보안을 위한 고유 ID
        tokenId: cryptoUtil.generateUUID()
      };

      return jwt.sign(
        refreshPayload,
        this.secret,
        {
          expiresIn: this.refreshTokenExpiry,
          issuer: 'ai-web-chatting',
          audience: 'ai-web-chatting-users'
        }
      );
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * 토큰 쌍 생성 (Access + Refresh)
   * @param {Object} user - 사용자 정보
   * @returns {Object} - { accessToken, refreshToken, expiresAt }
   */
  generateTokenPair(user) {
    try {
      const payload = {
        userId: user.id,
        email: user.email,
        name: user.name
      };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);
      
      // 토큰 만료 시간 계산 (refresh token 기준)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 5); // 5시간 후

      return {
        accessToken,
        refreshToken,
        expiresAt
      };
    } catch (error) {
      console.error('Error generating token pair:', error);
      throw new Error('Failed to generate tokens');
    }
  }

  /**
   * 토큰 검증
   * @param {string} token - 검증할 토큰
   * @param {string} tokenType - 토큰 타입 (access/refresh)
   * @returns {Object} - 디코딩된 페이로드
   */
  verifyToken(token, tokenType = 'access') {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'ai-web-chatting',
        audience: 'ai-web-chatting-users'
      });

      // 토큰 타입 확인
      if (decoded.type !== tokenType) {
        throw new Error(`Invalid token type. Expected ${tokenType}, got ${decoded.type}`);
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Access Token 검증
   * @param {string} token - Access Token
   * @returns {Object} - 디코딩된 페이로드
   */
  verifyAccessToken(token) {
    return this.verifyToken(token, 'access');
  }

  /**
   * Refresh Token 검증
   * @param {string} token - Refresh Token
   * @returns {Object} - 디코딩된 페이로드
   */
  verifyRefreshToken(token) {
    return this.verifyToken(token, 'refresh');
  }

  /**
   * 토큰에서 사용자 정보 추출 (검증 없이)
   * @param {string} token - JWT 토큰
   * @returns {Object|null} - 디코딩된 페이로드
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * 토큰 만료 시간 확인
   * @param {string} token - JWT 토큰
   * @returns {Date|null} - 만료 시간
   */
  getTokenExpiry(token) {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      console.error('Error getting token expiry:', error);
      return null;
    }
  }

  /**
   * 토큰 갱신 (Refresh Token으로 새로운 Access Token 발급)
   * @param {string} refreshToken - Refresh Token
   * @returns {Object} - { accessToken, refreshToken }
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Refresh token 검증
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // 새로운 토큰 생성을 위한 사용자 정보
      const user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name || 'User' // refresh token에는 name이 없을 수 있음
      };

      // 새로운 토큰 쌍 발급 (보안상 둘 다 새로 발급)
      const newTokens = this.generateTokenPair(user);

      return {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }
}

// 싱글톤 인스턴스 생성
const jwtUtil = new JWTUtil();

module.exports = jwtUtil;