const axios = require('axios');

class GeminiEmbeddingService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'gemini-embedding-001';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async generateEmbedding(text) {
    try {
      const url = `${this.baseUrl}/${this.model}:embedContent`;
      console.log({
        content: {
          parts: [{
            text: text
          }]
        },
        taskType:'RETRIEVAL_DOCUMENT',
        model: `models/${this.model}`,

      })
      const response = await axios.post(url, {
        content: {
          parts: [{
            text: text
          }]
        },
        taskType:'RETRIEVAL_DOCUMENT',
        model: `models/${this.model}`,
        outputDimensionality: 1536

      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        }
      });

      return response.data.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error.response?.data || error.message);
      throw error;
    }
  }

}

module.exports = new GeminiEmbeddingService();