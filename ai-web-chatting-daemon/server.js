require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const redisClient = require('./config/redis');
const AppDataSource = require('./config/database');
const qdrantService = require('./services/qdrantService');
const knowledgeProcessor = require('./services/knowledgeProcessor');
require('./workers/embeddingWorker');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      redis: redisClient.isOpen ? 'connected' : 'disconnected',
      database: AppDataSource.isInitialized ? 'connected' : 'disconnected'
    }
  });
});

// Queue status endpoint
app.get('/queue/status', async (req, res) => {
  try {
    const { embeddingQueue } = require('./config/queue');
    const jobCounts = await embeddingQueue.getJobCounts();
    res.json({
      status: 'ok',
      queue: 'embedding-queue',
      jobs: jobCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize services
async function initializeServices() {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis');

    // Initialize database
    await AppDataSource.initialize();
    console.log('Database connected');

    // Initialize Qdrant collection
    await qdrantService.initializeCollection();
    console.log('Qdrant collection initialized');

    // Start cron job
    knowledgeProcessor.startCronJob();
    console.log('Knowledge processor cron job started');

    // Start server
    app.listen(PORT, () => {
      console.log(`Embedding demon server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await redisClient.quit();
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await redisClient.quit();
  await AppDataSource.destroy();
  process.exit(0);
});

// Start the application
initializeServices();