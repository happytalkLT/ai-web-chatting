const { QdrantClient } = require('@qdrant/js-client-rest');

// Qdrant 클라이언트 인스턴스 생성
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

// 컬렉션 설정
const COLLECTION_NAME = 'awc_embeddings';
const VECTOR_SIZE = 1536;
/**
 * Qdrant 컬렉션 초기화
 */
async function initializeQdrant() {
  try {
    // 컬렉션 존재 여부 확인
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      col => col.name === COLLECTION_NAME
    );

    if (collectionExists) {
      // 기존 컬렉션의 벡터 차원 확인
      const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
      const currentVectorSize = collectionInfo.config.params.vectors.size;
      
      if (currentVectorSize !== VECTOR_SIZE) {
        console.log(`⚠️  Vector size mismatch. Current: ${currentVectorSize}, Expected: ${VECTOR_SIZE}`);
        console.log(`🔄 Recreating collection '${COLLECTION_NAME}'...`);
        
        // 기존 컬렉션 삭제
        await qdrantClient.deleteCollection(COLLECTION_NAME);
        console.log(`✅ Old collection deleted`);
        
        // 새 컬렉션 생성
        await createCollection();
      } else {
        console.log(`✅ Qdrant collection '${COLLECTION_NAME}' already exists with correct vector size`);
      }
    } else {
      // 컬렉션이 없으면 생성
      await createCollection();
    }
  } catch (error) {
    console.error('❌ Error initializing Qdrant:', error);
    throw error;
  }
}

/**
 * 컬렉션 생성
 */
async function createCollection() {
  await qdrantClient.createCollection(COLLECTION_NAME, {
    vectors: {
      size: VECTOR_SIZE,
      distance: 'Cosine' // 코사인 유사도 사용
    }
  });
  console.log(`✅ Qdrant collection '${COLLECTION_NAME}' created successfully with vector size ${VECTOR_SIZE}`);
}

module.exports = {
  qdrantClient,
  COLLECTION_NAME,
  VECTOR_SIZE,
  initializeQdrant
};