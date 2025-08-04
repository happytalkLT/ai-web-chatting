require('dotenv').config();
const { createConnection } = require('mysql2/promise');

async function fixForeignKeys() {
  let connection;
  
  try {
    connection = await createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('=== Fixing Foreign Key Issues ===\n');

    // 1. 외래 키 제약 조건 확인
    console.log('1. Checking existing foreign keys...');
    const [foreignKeys] = await connection.query(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
      AND REFERENCED_TABLE_NAME IS NOT NULL
      AND TABLE_NAME = 'knowledge'
    `, [process.env.DB_NAME]);

    console.log('Found foreign keys:', foreignKeys);

    // 2. 컬럼 타입 확인
    console.log('\n2. Checking column types...');
    const [knowledgeCol] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_SET_NAME, COLLATION_NAME, COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'knowledge' AND COLUMN_NAME = 'uploaderId'
    `, [process.env.DB_NAME]);

    const [usersCol] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_SET_NAME, COLLATION_NAME, COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'id'
    `, [process.env.DB_NAME]);

    console.log('knowledge.uploaderId:', knowledgeCol[0]);
    console.log('users.id:', usersCol[0]);

    // 3. 외래 키 제약 조건 삭제
    console.log('\n3. Dropping foreign key constraints...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const fk of foreignKeys) {
      try {
        await connection.query(`ALTER TABLE knowledge DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
        console.log(`✅ Dropped foreign key: ${fk.CONSTRAINT_NAME}`);
      } catch (error) {
        console.log(`⚠️  Foreign key ${fk.CONSTRAINT_NAME} might not exist`);
      }
    }

    // 4. 컬럼 타입 맞추기
    console.log('\n4. Updating column types to match...');
    
    // uploaderId를 users.id와 같은 타입으로 변경
    if (usersCol[0]) {
      const targetType = usersCol[0].COLUMN_TYPE;
      const charset = usersCol[0].CHARACTER_SET_NAME || 'utf8mb4';
      const collation = usersCol[0].COLLATION_NAME || 'utf8mb4_unicode_ci';
      
      await connection.query(`
        ALTER TABLE knowledge 
        MODIFY uploaderId ${targetType} 
        CHARACTER SET ${charset} 
        COLLATE ${collation} 
        NOT NULL
      `);
      console.log(`✅ Updated knowledge.uploaderId to match users.id type`);
    }

    // 5. 외래 키 다시 생성
    console.log('\n5. Recreating foreign key...');
    await connection.query(`
      ALTER TABLE knowledge 
      ADD CONSTRAINT FK_knowledge_uploaderId 
      FOREIGN KEY (uploaderId) 
      REFERENCES users(id) 
      ON DELETE CASCADE 
      ON UPDATE CASCADE
    `);
    console.log('✅ Foreign key recreated successfully');

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ Foreign key issues fixed successfully!');
    console.log('You can now enable synchronize in database.js again.');

  } catch (error) {
    console.error('❌ Error fixing foreign keys:', error);
    if (connection) {
      await connection.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 스크립트 실행
fixForeignKeys();