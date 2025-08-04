const {getGeminiApiUrl, GEMINI_API} = require('../constants/gemini');

// Google Gemini 임베딩 모델 사용
const embeddingModel = getGeminiApiUrl('EMBEDDING', 'EMBEDDING')

const apiKey = process.env.GEMINI_API_KEY;

const EMBEDDING_TASK_TYPES = {
  SEMANTIC_SIMILARITY: 'SEMANTIC_SIMILARITY',
  CLASSIFICATION: 'CLASSIFICATION',
  CLUSTERING: 'CLUSTERING',
  RETRIEVAL_DOCUMENT: 'RETRIEVAL_DOCUMENT',
  RETRIEVAL_QUERY: 'RETRIEVAL_QUERY',
}

class EmbeddingUtil {
  /**
   * 텍스트를 임베딩 벡터로 변환 (Gemini 사용)
   * @param {string} text - 임베딩할 텍스트
   * @param {string} taskType - 임베딩 테스크 유형
   * @returns {Promise<Array<number>>} - 임베딩 벡터
   */
  static async createEmbedding(text, taskType = 'SEMANTIC_SIMILARITY') {
    try {

      const response = await fetch(embeddingModel, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          model: `models/${GEMINI_API.MODEL.EMBEDDING}`,
          content: {
            parts: [{ text }]
          },
          taskType: EMBEDDING_TASK_TYPES[taskType],
          outputDimensionality: 1536
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      if (data.embedding && data.embedding.values) {
        return data.embedding.values;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error creating embedding with Gemini:', error);
      throw error;
    }
  }

  /**
   * 여러 텍스트를 한 번에 임베딩
   * @param {Array<string>} texts - 임베딩할 텍스트 배열
   * @returns {Promise<Array<Array<number>>>} - 임베딩 벡터 배열
   */
  static async createBatchEmbeddings(texts, taskType = 'SEMANTIC_SIMILARITY') {
    try {
      const embeddings = await Promise.all(
        texts.map(text => this.createEmbedding(text, taskType))
      );
      return embeddings;
    } catch (error) {
      console.error('Error creating batch embeddings:', error);
      throw error;
    }
  }

  /**
   * 간단한 임베딩 생성 (테스트용 - 실제로는 사용하지 마세요)
   * 실제 환경에서는 OpenAI, Cohere, HuggingFace 등의 임베딩 모델을 사용하세요
   * @param {string} text - 임베딩할 텍스트
   * @param {number} dimension - 벡터 차원
   * @returns {Array<number>} - 더미 임베딩 벡터
   */
  static createDummyEmbedding(text, dimension = 1536) {
    // 텍스트를 기반으로 일관된 더미 벡터 생성
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const vector = [];

    for (let i = 0; i < dimension; i++) {
      // 시드를 기반으로 -1과 1 사이의 값 생성
      const value = Math.sin(seed * (i + 1)) * Math.cos(seed / (i + 1));
      vector.push(value);
    }

    // 벡터 정규화
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }

  /**
   * 두 벡터 간의 코사인 유사도 계산
   * @param {Array<number>} vector1 - 첫 번째 벡터
   * @param {Array<number>} vector2 - 두 번째 벡터
   * @returns {number} - 코사인 유사도 (-1 ~ 1)
   */
  static cosineSimilarity(vector1, vector2) {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same dimension');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * 문서 형식의 텍스트를 청크 분할 작업
   * 청크 방식은 500자 기준으로 분할하며, 각 청크는 앞뒤 50자씩 겹침
   * @param {string} document - 문서
   * @returns {string[]} - 청크 단위 문서
   */
  static documentChunking (document) {
    if (!document || typeof document !== 'string') {
      return [];
    }

    const chunks = [];
    const chunkSize = 500;
    const overlapSize = 50;
    const stepSize = chunkSize - overlapSize; // 450자씩 이동
    
    // 공백 문자 정리
    const cleanedDocument = document.replace(/\s+/g, ' ').trim();
    
    if (cleanedDocument.length <= chunkSize) {
      return [cleanedDocument];
    }
    
    for (let i = 0; i < cleanedDocument.length; i += stepSize) {
      let chunk = cleanedDocument.substring(i, i + chunkSize);
      
      // 마지막 청크가 너무 작으면 이전 청크와 합치기
      if (i + chunkSize >= cleanedDocument.length) {
        chunk = cleanedDocument.substring(i);
        if (chunk.length < overlapSize && chunks.length > 0) {
          // 마지막 청크가 너무 작으면 이전 청크와 합치기
          chunks[chunks.length - 1] += chunk;
          break;
        }
      }
      
      chunks.push(chunk);
      
      // 마지막 청크면 종료
      if (i + chunkSize >= cleanedDocument.length) {
        break;
      }
    }
    
    return chunks;
  }
}


module.exports = EmbeddingUtil;