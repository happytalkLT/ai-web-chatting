const { QdrantClient } = require('@qdrant/js-client-rest');

class QdrantService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333'
    });
    this.collectionName = 'awc_embeddings';
  }

  async initializeCollection() {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === this.collectionName);

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 1536,
            distance: 'Cosine'
          }
        });
        console.log(`Collection ${this.collectionName} created`);
      }
    } catch (error) {
      console.error('Error initializing Qdrant collection:', error);
      throw error;
    }
  }

  async upsertEmbedding(id, vector, payload) {
    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [{
          id: id,
          vector: vector,
          payload: payload
        }]
      });
      console.log(`Embedding ${id} upserted successfully`);
    } catch (error) {
      console.error('Error upserting embedding:', error);
      throw error;
    }
  }


  async search(vector, limit = 10) {
    try {
      const searchResult = await this.client.search(this.collectionName, {
        vector: vector,
        limit: limit,
        with_payload: true
      });
      return searchResult;
    } catch (error) {
      console.error('Error searching embeddings:', error);
      throw error;
    }
  }
}

module.exports = new QdrantService();