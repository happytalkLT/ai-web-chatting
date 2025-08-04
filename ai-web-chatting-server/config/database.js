const { DataSource } = require('typeorm');
require('reflect-metadata');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'aiwebchatting',
  entities: [
    __dirname + '/../entities/*.js'
  ],
  synchronize: false, // 임시로 비활성화 - 외래키 문제 해결 필요
  logging: false, // 쿼리 로그 비활성화
  // migrations: [
  //   __dirname + '/../migrations/*.js'
  // ],
  // migrationsRun: false,
  charset: 'utf8mb4',
  timezone: '+09:00', // 한국 시간대
  extra: {
    connectionLimit: 10,
    multipleStatements: false
  }
});

module.exports = AppDataSource;