// 데이터베이스 스키마 업데이트 스크립트
// messageType enum에 'model' 값 추가

const AppDataSource = require('../config/database');
require('dotenv').config();

async function updateMessageTypeEnum() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    
    console.log('🔄 Updating messageType enum...');
    
    // 현재 enum 값 확인
    const currentEnum = await AppDataSource.query(`
      SHOW COLUMNS FROM chat_messages LIKE 'messageType'
    `);
    
    console.log('📋 Current messageType enum:', currentEnum[0]?.Type);
    
    // enum 값 업데이트
    await AppDataSource.query(`
      ALTER TABLE chat_messages 
      MODIFY COLUMN messageType ENUM('text', 'image', 'file', 'system', 'model') DEFAULT 'text'
    `);
    
    console.log('✅ messageType enum updated successfully');
    
    // 업데이트 확인
    const updatedEnum = await AppDataSource.query(`
      SHOW COLUMNS FROM chat_messages LIKE 'messageType'
    `);
    
    console.log('📋 Updated messageType enum:', updatedEnum[0]?.Type);
    
    // 기존 AI 응답 메시지들을 'model' 타입으로 업데이트 (metadata에 aiResponse: true가 있는 것들)
    const updateResult = await AppDataSource.query(`
      UPDATE chat_messages 
      SET messageType = 'model' 
      WHERE messageType = 'system' 
      AND JSON_EXTRACT(metadata, '$.aiResponse') = true
    `);
    
    console.log(`✅ Updated ${updateResult.affectedRows} existing AI response messages to 'model' type`);
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  updateMessageTypeEnum()
    .then(() => {
      console.log('🎉 Schema update completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Schema update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateMessageTypeEnum };