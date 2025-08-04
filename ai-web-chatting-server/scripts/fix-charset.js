require('dotenv').config();
const { createConnection } = require('mysql2/promise');

async function fixCharset() {
  let connection;
  
  try {
    connection = await createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('=== Fixing Database Charset to utf8mb4 ===\n');

    // 외래키 체크 비활성화
    console.log('0. Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('   ✅ Foreign key checks disabled');

    // 1. 데이터베이스 기본 charset 변경
    console.log('1. Updating database default charset...');
    await connection.query(`ALTER DATABASE ${process.env.DB_NAME} CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci`);
    console.log('   ✅ Database charset updated to utf8mb4');

    // 2. chat_messages 테이블의 charset 변경
    console.log('\n2. Updating chat_messages table charset...');
    await connection.query('ALTER TABLE chat_messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('   ✅ chat_messages table converted to utf8mb4');

    // 3. chat_messages.content 컬럼 명시적으로 변경
    console.log('\n3. Updating chat_messages.content column...');
    await connection.query('ALTER TABLE chat_messages MODIFY content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL');
    console.log('   ✅ content column updated to utf8mb4');

    // 4. 다른 테이블들도 utf8mb4로 변경
    console.log('\n4. Updating other tables...');
    const tables = ['chat_rooms', 'users', 'chat_participants', 'tokens'];
    
    for (const table of tables) {
      try {
        await connection.query(`ALTER TABLE ${table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`   ✅ ${table} table converted to utf8mb4`);
      } catch (error) {
        console.log(`   ❌ Failed to convert ${table}: ${error.message}`);
      }
    }

    console.log('\n=== Charset Fix Complete ===');
    console.log('✅ Database is now ready to store emojis and other Unicode characters!');

  } catch (error) {
    console.error('Error fixing charset:', error);
  } finally {
    if (connection) {
      try {
        // 외래키 체크 다시 활성화
        console.log('\nRe-enabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Foreign key checks re-enabled');
      } catch (e) {
        console.error('Failed to re-enable foreign key checks:', e.message);
      }
      await connection.end();
    }
  }
}

// 스크립트 실행
fixCharset();