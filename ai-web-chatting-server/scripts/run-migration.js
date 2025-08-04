require('dotenv').config();
const { initializeDatabase, getDataSource } = require('../config/db-connect');
const UpdateCharsetToUtf8mb4 = require('../migrations/1704900000000-UpdateCharsetToUtf8mb4');

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await initializeDatabase();
    const dataSource = getDataSource();
    
    console.log('\n=== Running UTF8MB4 Migration ===\n');
    
    const migration = new UpdateCharsetToUtf8mb4();
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      console.log('Executing migration...');
      await migration.up(queryRunner);
      
      await queryRunner.commitTransaction();
      console.log('\n✅ Migration completed successfully!');
      console.log('Your database now supports emojis and all UTF-8 characters.');
      
    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

// Add confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n⚠️  WARNING: This migration will alter your database tables to use UTF8MB4 charset.');
console.log('This is necessary to support emojis and 4-byte UTF-8 characters.');
console.log('Make sure you have a backup of your database before proceeding.\n');

rl.question('Do you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    rl.close();
    runMigration();
  } else {
    console.log('Migration cancelled.');
    rl.close();
    process.exit(0);
  }
});