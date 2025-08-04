require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var aiRouter = require('./routes/ai');
var vectorRouter = require('./routes/vector');
var ragRouter = require('./routes/rag');
var roomRouter = require('./routes/room');

const { initializeDatabase } = require('./config/db-connect');
const { startTokenCleanupJob } = require('./utils/tokenCleanup');
const { initializeQdrant } = require('./config/qdrant');

var app = express();

// Initialize function to be called from www
async function initializeApp() {
  try {
    // 데이터베이스 및 벡터 DB 초기화
    await Promise.all([
      initializeDatabase(),
      initializeQdrant()
    ]);
    
    // 데이터베이스가 초기화된 후 토큰 정리 작업 시작 (6시간마다 실행)
    startTokenCleanupJob(360);
    console.log('✅ All services initialized successfully');
    
    return app;
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
}

// CORS 설정 추가
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/ai', aiRouter);
app.use('/vector', vectorRouter);
app.use('/rag', ragRouter);
app.use('/room', roomRouter);

module.exports = app;
module.exports.initializeApp = initializeApp;
