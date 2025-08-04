const crypto = require('crypto');

class CryptoUtil {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = process.env.ENCRYPT_KEY;
    
    if (!this.secretKey) {
      throw new Error('ENCRYPT_KEY environment variable is required');
    }
    
    // 32바이트 키 생성 (AES-256용)
    this.key = crypto.scryptSync(this.secretKey, 'salt', 32);
  }

  /**
   * 비밀번호 해싱 (단방향 암호화)
   * @param {string} password - 원본 비밀번호
   * @returns {string} - 해싱된 비밀번호
   */
  hashPassword(password) {
    try {
      // salt 생성
      const salt = crypto.randomBytes(16).toString('hex');
      
      // PBKDF2를 사용한 해싱 (bcrypt 대안)
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      
      // salt와 hash를 합쳐서 저장
      return `${salt}:${hash}`;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * 비밀번호 검증
   * @param {string} password - 검증할 원본 비밀번호
   * @param {string} hashedPassword - 저장된 해싱된 비밀번호
   * @returns {boolean} - 일치 여부
   */
  verifyPassword(password, hashedPassword) {
    try {
      // salt와 hash 분리
      const [salt, hash] = hashedPassword.split(':');
      
      if (!salt || !hash) {
        return false;
      }
      
      // 동일한 방식으로 해싱하여 비교
      const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      
      // timing attack 방지를 위한 constant-time 비교
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * 데이터 암호화 (양방향 암호화)
   * @param {string} text - 암호화할 텍스트
   * @returns {string} - 암호화된 데이터
   */
  encrypt(text) {
    try {
      // IV(Initialization Vector) 생성
      const iv = crypto.randomBytes(16);
      
      // 암호화 객체 생성
      const cipher = crypto.createCipher(this.algorithm, this.key);
      cipher.setAAD(Buffer.from('additional data'));
      
      // 암호화 실행
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // 인증 태그 가져오기
      const authTag = cipher.getAuthTag();
      
      // IV, authTag, encrypted를 합쳐서 반환
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * 데이터 복호화
   * @param {string} encryptedData - 암호화된 데이터
   * @returns {string} - 복호화된 텍스트
   */
  decrypt(encryptedData) {
    try {
      // IV, authTag, encrypted 분리
      const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
      
      if (!ivHex || !authTagHex || !encrypted) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      // 복호화 객체 생성
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      decipher.setAAD(Buffer.from('additional data'));
      decipher.setAuthTag(authTag);
      
      // 복호화 실행
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * 랜덤 토큰 생성
   * @param {number} length - 토큰 길이 (기본: 32바이트)
   * @returns {string} - 랜덤 토큰
   */
  generateToken(length = 32) {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      console.error('Error generating token:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * UUID 생성
   * @returns {string} - UUID v4
   */
  generateUUID() {
    try {
      return crypto.randomUUID();
    } catch (error) {
      // Node.js 14 이하 버전 호환성
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  /**
   * 해시 생성 (파일 체크섬 등에 사용)
   * @param {string} data - 해시할 데이터
   * @param {string} algorithm - 해시 알고리즘 (기본: sha256)
   * @returns {string} - 해시값
   */
  createHash(data, algorithm = 'sha256') {
    try {
      return crypto.createHash(algorithm).update(data).digest('hex');
    } catch (error) {
      console.error('Error creating hash:', error);
      throw new Error('Hash creation failed');
    }
  }
}

// 싱글톤 인스턴스 생성
const cryptoUtil = new CryptoUtil();

module.exports = cryptoUtil;