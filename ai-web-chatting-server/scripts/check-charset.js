require('dotenv').config();
const { initializeDatabase, getDataSource } = require('../config/db-connect');

async function checkCharset() {
  try {
    console.log('Connecting to database...');
    await initializeDatabase();
    const dataSource = getDataSource();
    
    console.log('\n=== Database Charset Information ===\n');
    
    // Check database charset
    const dbCharset = await dataSource.query(`
      SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME = '${process.env.DB_NAME || 'aiwebchatting'}'
    `);
    
    console.log('Database Default Charset:');
    console.log(dbCharset[0]);
    console.log('\n');
    
    // Check table charsets
    const tableCharsets = await dataSource.query(`
      SELECT TABLE_NAME, TABLE_COLLATION 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'aiwebchatting'}'
      AND TABLE_TYPE = 'BASE TABLE'
    `);
    
    console.log('Table Charsets:');
    tableCharsets.forEach(table => {
      console.log(`- ${table.TABLE_NAME}: ${table.TABLE_COLLATION}`);
    });
    console.log('\n');
    
    // Check column charsets for content columns
    const columnCharsets = await dataSource.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME, DATA_TYPE
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'aiwebchatting'}'
      AND COLUMN_NAME = 'content'
      AND DATA_TYPE IN ('text', 'varchar', 'char')
    `);
    
    console.log('Content Column Charsets:');
    columnCharsets.forEach(col => {
      console.log(`- ${col.TABLE_NAME}.${col.COLUMN_NAME}: ${col.CHARACTER_SET_NAME} (${col.COLLATION_NAME})`);
    });
    console.log('\n');
    
    // Check for potential problematic columns
    const problematicColumns = await dataSource.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'aiwebchatting'}'
      AND DATA_TYPE IN ('text', 'varchar', 'char')
      AND (CHARACTER_SET_NAME != 'utf8mb4' OR CHARACTER_SET_NAME IS NULL)
    `);
    
    if (problematicColumns.length > 0) {
      console.log('⚠️  Columns that may need charset update:');
      problematicColumns.forEach(col => {
        console.log(`- ${col.TABLE_NAME}.${col.COLUMN_NAME}: ${col.CHARACTER_SET_NAME || 'NULL'}`);
      });
    } else {
      console.log('✅ All text columns are using utf8mb4!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking charset:', error);
    process.exit(1);
  }
}

checkCharset();