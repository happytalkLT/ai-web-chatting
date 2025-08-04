const { DataSource } = require('typeorm');
const Knowledge = require('../entities/Knowledge');
const User = require('../entities/User');
const Token = require('../entities/Token');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_web_chatting',
  synchronize: false,
  logging: false,
  entities: [Knowledge, User, Token],
  charset: 'utf8mb4'
});

module.exports = AppDataSource;