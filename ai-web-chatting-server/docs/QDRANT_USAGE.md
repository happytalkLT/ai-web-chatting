# Qdrant 벡터 DB 사용 가이드

## 개요
이 문서는 AI 웹 채팅 서버에서 Qdrant 벡터 데이터베이스를 사용하는 방법을 설명합니다.

## 사전 준비

### 1. Qdrant 설치 및 실행

#### Docker를 사용한 설치 (권장)
```bash
# Qdrant 컨테이너 실행
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

#### Docker Compose 사용
```yaml
# docker-compose.yml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage:/qdrant/storage:z
```

### 2. 환경 변수 설정
`.env` 파일에 다음 내용 추가:
```env
QDRANT_URL=http://localhost:6333
# 클라우드 Qdrant 사용 시
# QDRANT_API_KEY=your-api-key-here
```

## API 엔드포인트

### 1. 채팅 메시지 저장
```bash
POST /vector/store-message
Authorization: Bearer <access_token>

{
  "message": "안녕하세요, 오늘 날씨가 좋네요!",
  "roomId": "room123"
}
```

응답:
```json
{
  "success": true,
  "message": "벡터 저장 성공",
  "data": {
    "vectorId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "메시지가 벡터 DB에 저장되었습니다."
  }
}
```

### 2. 유사한 메시지 검색
```bash
POST /vector/search-similar
Authorization: Bearer <access_token>

{
  "query": "날씨",
  "limit": 5,
  "userOnly": false
}
```

응답:
```json
{
  "success": true,
  "message": "유사 메시지 검색 완료",
  "data": {
    "query": "날씨",
    "results": [
      {
        "message": "안녕하세요, 오늘 날씨가 좋네요!",
        "score": 0.95,
        "metadata": {
          "userId": "user123",
          "roomId": "room123",
          "role": "user",
          "createdAt": "2024-01-01T12:00:00Z"
        }
      }
    ],
    "count": 1
  }
}
```

### 3. 지식 베이스 저장
```bash
POST /vector/store-knowledge
Authorization: Bearer <access_token>

{
  "title": "React Hooks 가이드",
  "content": "React Hooks는 함수형 컴포넌트에서 상태와 생명주기를 다룰 수 있게 해주는 기능입니다...",
  "category": "programming",
  "source": "documentation"
}
```

### 4. 지식 베이스 검색
```bash
POST /vector/search-knowledge
Authorization: Bearer <access_token>

{
  "query": "React Hooks 사용법",
  "category": "programming",
  "limit": 3
}
```

### 5. 컬렉션 정보 조회
```bash
GET /vector/collection-info
Authorization: Bearer <access_token>
```

응답:
```json
{
  "success": true,
  "message": "컬렉션 정보 조회 성공",
  "data": {
    "vectorsCount": 150,
    "pointsCount": 150,
    "indexedVectorsCount": 150,
    "status": "green"
  }
}
```

### 6. 임베딩 테스트 (개발용)
```bash
POST /vector/test-embedding

{
  "text": "테스트 메시지입니다",
  "useDummy": true
}
```

## 활용 사례

### 1. 대화 컨텍스트 유지
사용자의 이전 대화를 벡터 DB에 저장하고, 새로운 질문이 들어올 때 관련된 이전 대화를 검색하여 컨텍스트를 유지할 수 있습니다.

```javascript
// 사용자 질문 처리
const userQuestion = "지난번에 얘기한 React 프로젝트는 어떻게 진행하면 좋을까요?";

// 1. 관련 이전 대화 검색
const similarMessages = await QdrantService.searchSimilarMessages(
  await EmbeddingUtil.createEmbedding(userQuestion),
  userId,
  5
);

// 2. AI에게 컨텍스트와 함께 전달
const context = similarMessages.map(m => m.message).join('\n');
const aiResponse = await generateAIResponse(userQuestion, context);
```

### 2. RAG (Retrieval-Augmented Generation) 구현
지식 베이스에서 관련 문서를 검색하여 AI의 답변 품질을 향상시킵니다.

```javascript
// 사용자 질문
const question = "React Hooks의 useEffect는 어떻게 사용하나요?";

// 1. 관련 지식 검색
const relevantDocs = await QdrantService.searchKnowledge(
  await EmbeddingUtil.createEmbedding(question),
  'programming',
  3
);

// 2. 검색된 지식을 프롬프트에 포함
const prompt = `
관련 문서:
${relevantDocs.map(doc => doc.content).join('\n\n')}

질문: ${question}
답변:
`;

const aiResponse = await generateAIResponse(prompt);
```

### 3. 유사 대화 추천
사용자가 질문할 때 유사한 이전 대화나 FAQ를 추천합니다.

```javascript
// 유사한 질문 찾기
const similarQuestions = await QdrantService.searchSimilarMessages(
  queryEmbedding,
  null, // 모든 사용자
  10
);

// 중복 제거 및 상위 5개 추천
const recommendations = [...new Set(similarQuestions.map(q => q.message))]
  .slice(0, 5);
```

## 주의사항

1. **임베딩 모델 일관성**: 저장과 검색에 동일한 임베딩 모델을 사용해야 합니다.
2. **벡터 차원**: 현재 설정은 1536 차원입니다. 다른 모델 사용 시 `VECTOR_SIZE` 수정 필요.
3. **성능**: 대량의 벡터 검색 시 인덱스 최적화가 필요할 수 있습니다.
4. **보안**: 프로덕션 환경에서는 Qdrant API 키를 반드시 설정하세요.

## 문제 해결

### Qdrant 연결 실패
```bash
# Qdrant 상태 확인
curl http://localhost:6333/health

# Docker 컨테이너 확인
docker ps | grep qdrant
```

### 임베딩 생성 실패
- Gemini API 키 확인
- 네트워크 연결 확인
- 테스트 모드(useDummy: true) 사용

### 검색 결과가 부정확한 경우
- 임베딩 모델 변경 고려
- 검색 임계값(score) 조정
- 더 많은 컨텍스트 정보 포함