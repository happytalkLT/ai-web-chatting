const { embeddingQueue } = require('../config/queue');
const geminiEmbedding = require('../services/geminiEmbedding');
const qdrantService = require('../services/qdrantService');
const AppDataSource = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function processChunkEmbedding(chunkData) {
  try {
    const { knowledgeId, title, category, source, chunkIndex, chunkText } = chunkData;
    // Generate embedding for single chunk
    const embedding = await geminiEmbedding.generateEmbedding(chunkText);
    
    // Create point for Qdrant
    const pointId = uuidv4();
    const point = {
      id: pointId,
      vector: embedding,
      payload: {
        knowledgeId: knowledgeId,
        title: title,
        category: category,
        source: source,
        chunkIndex: chunkIndex,
        text: chunkText,
      }
    };

    await qdrantService.upsertEmbedding(point.id, point.vector, point.payload);

    console.log(`Successfully processed embedding for knowledge ${knowledgeId}, chunk ${chunkIndex}`);
  } catch (error) {
    console.error('Error in embedding worker:', error);
    throw error;
  }
}

// Process queue jobs with 1 concurrency to ensure 1000ms between each processing
embeddingQueue.process(1, async (job) => {
  console.log(`Processing job ${job.id} for chunk ${job.data.chunkIndex} of knowledge ${job.data.knowledgeId}`);
  console.log(job.data)
  await processChunkEmbedding(job.data);
  
  // Add 1000ms delay after processing each chunk
  await new Promise(resolve => setTimeout(resolve, 1000));
});

module.exports = {
  processChunkEmbedding
};