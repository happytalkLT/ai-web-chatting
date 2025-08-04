const Bull = require('bull');

const embeddingQueue = new Bull('embedding-queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

embeddingQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed successfully`);
});

embeddingQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

module.exports = {
  embeddingQueue
};