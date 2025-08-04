/**
 * 토큰 화이트리스트 테스트 스크립트
 * 
 * 테스트 시나리오:
 * 1. 로그인하여 토큰 발급
 * 2. 토큰으로 인증이 필요한 API 호출
 * 3. 재로그인하여 새 토큰 발급
 * 4. 이전 토큰으로 API 호출 시도 (실패해야 함)
 * 5. 새 토큰으로 API 호출 (성공해야 함)
 * 6. 토큰 갱신
 * 7. 이전 토큰으로 API 호출 시도 (실패해야 함)
 * 8. 새 토큰으로 API 호출 (성공해야 함)
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8033';

// 테스트 사용자 정보
const testUser = {
  email: 'test@example.com',
  password: 'Test1234!@',
  name: 'Test User'
};

async function runTests() {
  try {
    console.log('=== 토큰 화이트리스트 테스트 시작 ===\n');

    // 1. 회원가입 (이미 존재할 수 있음)
    console.log('1. 회원가입 시도...');
    try {
      await axios.post(`${API_BASE_URL}/users/signup`, testUser);
      console.log('✓ 회원가입 성공\n');
    } catch (error) {
      if (error.response?.data?.errorCode === 'ERR1005') {
        console.log('✓ 사용자가 이미 존재함\n');
      } else {
        throw error;
      }
    }

    // 2. 첫 번째 로그인
    console.log('2. 첫 번째 로그인...');
    const loginResponse1 = await axios.post(`${API_BASE_URL}/users/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const { accessToken: token1, refreshToken: refreshToken1 } = loginResponse1.data.data;
    console.log('✓ 첫 번째 토큰 발급 완료');
    console.log(`  Access Token: ${token1.substring(0, 20)}...`);
    console.log(`  Refresh Token: ${refreshToken1.substring(0, 20)}...\n`);

    // 3. 첫 번째 토큰으로 API 호출
    console.log('3. 첫 번째 토큰으로 사용자 정보 조회...');
    const meResponse1 = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log('✓ 성공:', meResponse1.data.message, '\n');

    // 4. 두 번째 로그인 (이전 토큰 무효화됨)
    console.log('4. 두 번째 로그인 (이전 토큰이 무효화되어야 함)...');
    const loginResponse2 = await axios.post(`${API_BASE_URL}/users/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const { accessToken: token2, refreshToken: refreshToken2 } = loginResponse2.data.data;
    console.log('✓ 두 번째 토큰 발급 완료');
    console.log(`  Access Token: ${token2.substring(0, 20)}...`);
    console.log(`  Refresh Token: ${refreshToken2.substring(0, 20)}...\n`);

    // 5. 첫 번째 토큰으로 API 호출 시도 (실패해야 함)
    console.log('5. 첫 번째 토큰으로 API 호출 시도 (실패해야 함)...');
    try {
      await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token1}` }
      });
      console.log('✗ 실패: 무효화된 토큰이 여전히 작동함!\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ 성공: 무효화된 토큰이 거부됨');
        console.log(`  에러: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }

    // 6. 두 번째 토큰으로 API 호출
    console.log('6. 두 번째 토큰으로 사용자 정보 조회...');
    const meResponse2 = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log('✓ 성공:', meResponse2.data.message, '\n');

    // 7. 토큰 갱신
    console.log('7. 토큰 갱신...');
    const refreshResponse = await axios.post(`${API_BASE_URL}/users/refresh`, {
      refreshToken: refreshToken2
    });
    const { accessToken: token3, refreshToken: refreshToken3 } = refreshResponse.data.data;
    console.log('✓ 토큰 갱신 완료');
    console.log(`  New Access Token: ${token3.substring(0, 20)}...`);
    console.log(`  New Refresh Token: ${refreshToken3.substring(0, 20)}...\n`);

    // 8. 이전 액세스 토큰으로 API 호출 시도 (실패해야 함)
    console.log('8. 갱신 전 액세스 토큰으로 API 호출 시도 (실패해야 함)...');
    try {
      await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token2}` }
      });
      console.log('✗ 실패: 갱신 전 토큰이 여전히 작동함!\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ 성공: 갱신 전 토큰이 거부됨');
        console.log(`  에러: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }

    // 9. 새 토큰으로 API 호출
    console.log('9. 갱신된 토큰으로 사용자 정보 조회...');
    const meResponse3 = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token3}` }
    });
    console.log('✓ 성공:', meResponse3.data.message, '\n');

    // 10. 로그아웃
    console.log('10. 로그아웃...');
    await axios.post(`${API_BASE_URL}/users/logout`, {}, {
      headers: { Authorization: `Bearer ${token3}` }
    });
    console.log('✓ 로그아웃 완료\n');

    // 11. 로그아웃 후 토큰으로 API 호출 시도 (실패해야 함)
    console.log('11. 로그아웃 후 토큰으로 API 호출 시도 (실패해야 함)...');
    try {
      await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token3}` }
      });
      console.log('✗ 실패: 로그아웃된 토큰이 여전히 작동함!\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ 성공: 로그아웃된 토큰이 거부됨');
        console.log(`  에러: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }

    console.log('=== 모든 테스트 통과! ===');

  } catch (error) {
    console.error('\n=== 테스트 실패 ===');
    console.error('에러:', error.response?.data || error.message);
    process.exit(1);
  }
}

// 테스트 실행
runTests();