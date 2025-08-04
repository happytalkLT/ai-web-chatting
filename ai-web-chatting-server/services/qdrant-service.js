const { qdrantClient, COLLECTION_NAME } = require('../config/qdrant');
const { v4: uuidv4 } = require('uuid');

class QdrantService {
  /**
   * 벡터 데이터 저장
   * @param {Array<number>} vector - 임베딩 벡터
   * @param {Object} payload - 메타데이터
   * @returns {Promise<string>} - 생성된 포인트 ID
   */
  static async storeVector(vector, payload) {
    try {
      const pointId = uuidv4();
      
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: pointId,
            vector: vector,
            payload: {
              ...payload,
              createdAt: new Date().toISOString()
            }
          }
        ]
      });

      console.log(`✅ Vector stored with ID: ${pointId}`);
      return pointId;
    } catch (error) {
      console.error('❌ Error storing vector:', error);
      throw error;
    }
  }

  /**
   * 유사도 검색
   * @param {Array<number>} queryVector - 검색할 벡터
   * @param {number} limit - 반환할 결과 수
   * @param {Object} filter - 필터 조건
   * @returns {Promise<Array>} - 검색 결과
   */
  static async searchSimilar(queryVector, limit = 5, filter = null) {
    try {
      const searchParams = {
        vector: queryVector,
        limit,
        with_payload: true,
        with_vector: false
      };

      if (filter) {
        searchParams.filter = filter;
      }

      const results = await qdrantClient.search(COLLECTION_NAME, searchParams);
      
      return results.map(result => ({
        id: result.id,
        score: result.score,
        payload: result.payload
      }));
    } catch (error) {
      console.error('❌ Error searching vectors:', error);
      throw error;
    }
  }

  /**
   * 채팅 메시지 저장 (임베딩과 함께)
   * @param {string} message - 채팅 메시지
   * @param {Array<number>} embedding - 메시지 임베딩
   * @param {Object} metadata - 추가 메타데이터
   */
  static async storeChatMessage(message, embedding, metadata = {}) {
    const payload = {
      message,
      type: 'chat_message',
      userId: metadata.userId,
      roomId: metadata.roomId,
      role: metadata.role || 'user',
      ...metadata
    };

    return await this.storeVector(embedding, payload);
  }

  /**
   * 유사한 채팅 메시지 검색
   * @param {Array<number>} queryEmbedding - 검색 쿼리 임베딩
   * @param {string} userId - 사용자 ID (필터링용)
   * @param {number} limit - 결과 수
   */
  static async searchSimilarMessages(queryEmbedding, userId = null, limit = 5) {
    const filter = userId ? {
      must: [
        { key: 'type', match: { value: 'chat_message' } },
        { key: 'userId', match: { value: userId } }
      ]
    } : {
      must: [
        { key: 'type', match: { value: 'chat_message' } }
      ]
    };

    const results = await this.searchSimilar(queryEmbedding, limit, filter);
    
    return results.map(result => ({
      message: result.payload.message,
      score: result.score,
      metadata: {
        userId: result.payload.userId,
        roomId: result.payload.roomId,
        role: result.payload.role,
        createdAt: result.payload.createdAt
      }
    }));
  }

  /**
   * 지식 베이스 문서 저장
   * @param {string} content - 문서 내용
   * @param {Array<number>} embedding - 문서 임베딩
   * @param {Object} metadata - 문서 메타데이터
   */
  static async storeKnowledge(content, embedding, metadata = {}) {
    const payload = {
      content,
      type: 'knowledge',
      title: metadata.title,
      category: metadata.category,
      source: metadata.source,
      ...metadata
    };

    return await this.storeVector(embedding, payload);
  }

  /**
   * 지식 베이스에서 관련 문서 검색
   * @param {Array<number>} queryEmbedding - 검색 쿼리 임베딩
   * @param {string} category - 카테고리 필터
   * @param {number} limit - 결과 수
   */
  static async searchKnowledge(queryEmbedding, category = null, limit = 1) {
    const filter = category ? {
      must: [
        { key: 'category', match: { value: category } }
      ]
    } : {
      must: [
      ]
    };

    const results = await this.searchSimilar(queryEmbedding, limit, filter);
    
    return results.map(result => ({
      content: result.payload.text,
      title: result.payload.title,
      score: result.score,
      metadata: result.payload
    }));
  }

  /**
   * 벡터 삭제
   * @param {string|Array<string>} ids - 삭제할 ID(들)
   */
  static async deleteVectors(ids) {
    try {
      const idsArray = Array.isArray(ids) ? ids : [ids];
      
      await qdrantClient.delete(COLLECTION_NAME, {
        wait: true,
        points: idsArray
      });

      console.log(`✅ Deleted ${idsArray.length} vectors`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting vectors:', error);
      throw error;
    }
  }

  /**
   * 컬렉션 정보 조회
   */
  static async getCollectionInfo() {
    try {
      const info = await qdrantClient.getCollection(COLLECTION_NAME);
      return {
        vectorsCount: info.vectors_count,
        pointsCount: info.points_count,
        indexedVectorsCount: info.indexed_vectors_count,
        status: info.status
      };
    } catch (error) {
      console.error('❌ Error getting collection info:', error);
      throw error;
    }
  }
}

module.exports = QdrantService;