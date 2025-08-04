const MySQLDatabaseService = require('../services/mysql-database');

/**
 * 만료된 토큰 정리 작업
 * 이 함수는 주기적으로 실행되어 만료된 토큰을 삭제합니다.
 */
async function cleanupExpiredTokens() {
  try {
    const deletedCount = await MySQLDatabaseService.deleteExpiredTokens();
    console.log(`[Token Cleanup] ${deletedCount} expired tokens deleted.`);
    return deletedCount;
  } catch (error) {
    console.error('[Token Cleanup] Error cleaning up expired tokens:', error);
    throw error;
  }
}

/**
 * 토큰 정리 작업 시작
 * @param {number} intervalMinutes - 정리 작업 실행 간격 (분)
 */
function startTokenCleanupJob(intervalMinutes = 60) {
  // 즉시 한 번 실행
  cleanupExpiredTokens().catch(console.error);
  
  // 주기적으로 실행
  const intervalMs = intervalMinutes * 60 * 1000;
  const intervalId = setInterval(() => {
    cleanupExpiredTokens().catch(console.error);
  }, intervalMs);
  
  console.log(`[Token Cleanup] Started with ${intervalMinutes} minute interval`);
  
  // 프로세스 종료 시 interval 정리
  process.on('SIGINT', () => {
    clearInterval(intervalId);
    console.log('[Token Cleanup] Stopped');
  });
  
  return intervalId;
}

module.exports = {
  cleanupExpiredTokens,
  startTokenCleanupJob
};