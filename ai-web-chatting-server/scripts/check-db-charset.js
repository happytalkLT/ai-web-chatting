require('dotenv').config();
const { createConnection } = require('mysql2/promise');

async function checkDatabaseCharset() {
  let connection;
  
  try {
    // 데이터베이스 연결
    connection = await createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('=== Database Charset Check ===\n');

    // 데이터베이스 기본 charset 확인
    const [dbCharset] = await connection.query(`
      SELECT default_character_set_name, default_collation_name 
      FROM information_schema.SCHEMATA 
      WHERE schema_name = ?
    `, [process.env.DB_NAME]);
    
    console.log('Database Default Charset:');
    console.log(`  Character Set: ${dbCharset[0].default_character_set_name}`);
    console.log(`  Collation: ${dbCharset[0].default_collation_name}`);
    console.log();

    // 테이블별 charset 확인
    const tables = ['knowledge', 'chat_messages', 'chat_rooms', 'users', 'chat_participants', 'tokens'];
    
    console.log('Table Charsets:');
    for (const table of tables) {
      const [tableInfo] = await connection.query(`
        SELECT TABLE_COLLATION 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `, [process.env.DB_NAME, table]);
      
      if (tableInfo.length > 0) {
        console.log(`  ${table}: ${tableInfo[0].TABLE_COLLATION}`);
      } else {
        console.log(`  ${table}: Table not found`);
      }
    }
    console.log();

    // 문제가 있는 컬럼 확인 (utf8mb4가 아닌 경우)
    console.log('Columns with non-utf8mb4 charset:');
    const [problemColumns] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND CHARACTER_SET_NAME IS NOT NULL
      AND CHARACTER_SET_NAME != 'utf8mb4'
      ORDER BY TABLE_NAME, COLUMN_NAME
    `, [process.env.DB_NAME]);

    if (problemColumns.length === 0) {
      console.log('  ✅ All columns are using utf8mb4');
    } else {
      problemColumns.forEach(col => {
        console.log(`  ❌ ${col.TABLE_NAME}.${col.COLUMN_NAME}: ${col.CHARACTER_SET_NAME} (${col.COLLATION_NAME})`);
      });
    }
    console.log();

    // content 컬럼들 상세 확인
    console.log('Content columns charset details:');
    const contentColumns = [
      { table: 'knowledge', column: 'content' },
      { table: 'knowledge', column: 'title' },
      { table: 'chat_messages', column: 'content' }
    ];

    for (const { table, column } of contentColumns) {
      const [colInfo] = await connection.query(`
        SELECT COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME, COLUMN_TYPE
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
      `, [process.env.DB_NAME, table, column]);

      if (colInfo.length > 0) {
        const col = colInfo[0];
        const status = col.CHARACTER_SET_NAME === 'utf8mb4' ? '✅' : '❌';
        console.log(`  ${status} ${table}.${column}: ${col.CHARACTER_SET_NAME || 'N/A'} (${col.COLLATION_NAME || 'N/A'})`);
      }
    }

    console.log('\n=== Recommendations ===');
    if (dbCharset[0].default_character_set_name !== 'utf8mb4') {
      console.log('❗ Database default charset is not utf8mb4. Run the migration to fix this.');
    }
    
    if (problemColumns.length > 0) {
      console.log('❗ Some columns are not using utf8mb4. Run the migration to fix this.');
      console.log('   Command: npm run migrate');
    } else {
      console.log('✅ All columns are properly configured for emoji support!');
    }

  } catch (error) {
    console.error('Error checking database charset:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 스크립트 실행
checkDatabaseCharset();