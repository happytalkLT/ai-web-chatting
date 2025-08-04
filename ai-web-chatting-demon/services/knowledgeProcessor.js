const cron = require('node-cron');
const AppDataSource = require('../config/database');
const { embeddingQueue } = require('../config/queue');

class KnowledgeProcessor {
  constructor() {
    this.isProcessing = false;
  }

  async processUnsyncedKnowledge() {
    if (this.isProcessing) {
      console.log('Previous processing still in progress, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      const knowledgeRepository = AppDataSource.getRepository('Knowledge');
      
      // Find all knowledge entries that haven't been synced and have chunks
      const unsyncedKnowledge = await knowledgeRepository.find({
        where: {
          isSync: false,
          isDeleted: false
        }
      });

      console.log(`Found ${unsyncedKnowledge.length} unsynced knowledge entries`);

      for (const knowledge of unsyncedKnowledge) {
        // Check if chunks exist
        if (!knowledge.chunk || knowledge.chunk.length === 0) {
          console.log(`Skipping knowledge ${knowledge.id} - no chunks found`);
          continue;
        }

        // Add each chunk to embedding queue individually
        for (let i = 0; i < knowledge.chunk.length; i++) {
          const chunk = knowledge.chunk[i];
          await embeddingQueue.add({
            knowledgeId: knowledge.id,
            title: knowledge.title,
            category: knowledge.category,
            source: knowledge.source,
            chunkIndex: i,
            chunkText: chunk,
          }, {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000
            },
            delay: i * 1000 // 1000ms delay between each chunk
          });
        }

        console.log(`Added ${knowledge.chunk.length} chunks from knowledge ${knowledge.id} to embedding queue`);
        await knowledgeRepository.update(
          { id: knowledge.id },
          { isSync: true }
        );
        console.log(`Knowledge ${knowledge.id} fully synced`);
      }
    } catch (error) {
      console.error('Error processing unsynced knowledge:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  startCronJob() {
    const schedule = process.env.CRON_SCHEDULE || '*/1 * * * *';
    
    console.log(`Starting knowledge processing cron job with schedule: ${schedule}`);
    
    cron.schedule(schedule, async () => {
      console.log('Running scheduled knowledge processing...');
      await this.processUnsyncedKnowledge();
    });

    // Run once on startup
    this.processUnsyncedKnowledge();
  }
}

module.exports = new KnowledgeProcessor();