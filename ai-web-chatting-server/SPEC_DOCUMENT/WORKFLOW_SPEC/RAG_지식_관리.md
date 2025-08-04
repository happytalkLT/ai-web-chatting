# RAG 지식 관리

## 개요

RAG(Retrieval-Augmented Generation) 지식 관리 워크플로우는 문서 기반 지식베이스를 구축하고 관리하는 시스템입니다. 사용자가 텍스트나 파일을 통해 지식 문서를 생성하고, 이를 벡터 데이터베이스에 저장하여 의미 기반 검색과 AI 챗봇의 RAG 기능에 활용할 수 있도록 합니다. 이 워크플로우는 지식 문서 생성, 임베딩 벡터 변환, 저장, 검색의 전체 과정을 포괄합니다.

## 상세 설명

RAG 지식 관리 워크플로우는 다음과 같은 핵심 기능들을 제공합니다:

1. **지식 문서 생성**: 사용자가 직접 텍스트를 입력하여 지식 문서를 생성하거나, 텍스트 파일(.txt)을 업로드하여 지식 문서를 생성할 수 있습니다.

2. **문서 청킹**: 입력된 텍스트는 500자 단위로 분할되며, 인접한 청크 간 50자씩 겹치도록 처리하여 문맥을 보존합니다.

3. **임베딩 변환**: Google Gemini의 embedding-exp-03-07 모델을 사용하여 텍스트를 1536차원의 벡터로 변환합니다.

4. **저장**: 원본 지식 문서는 MySQL 데이터베이스에 저장되고, 청크 단위로 분할된 내용은 임베딩 벡터와 함께 Qdrant 벡터 데이터베이스에 저장됩니다.

5. **검색**: 사용자의 검색 쿼리를 임베딩으로 변환하여 유사도 기반으로 관련 지식을 검색합니다.

6. **RAG 통합**: AI 챗봇이 function calling을 통해 관련 지식을 검색하여 답변에 활용합니다.

이 시스템은 JWT 기반 인증을 통해 사용자별로 지식 관리가 가능하며, 카테고리별 분류와 필터링을 지원합니다.

## Flow

### Flow Chart

```mermaid
flowchart TD
    A[사용자 지식 생성 요청] --> B{생성 방식 선택}
    B -->|텍스트 직접 입력| C[POST /rag/knowledge/document]
    B -->|파일 업로드| D[POST /rag/knowledge/document/file]
    
    C --> E[authenticateToken 미들웨어]
    D --> F[authenticateToken + upload.single 미들웨어]
    
    E --> G{토큰 검증}
    F --> G
    G -->|실패| H[401 Unauthorized]
    G -->|성공| I[파라미터 검증]
    
    I --> J{필수 필드 존재?}
    J -->|실패| K[400 Bad Request]
    J -->|성공| L[EmbeddingUtil.documentChunking]
    
    L --> M[텍스트 청크 분할<br/>500자 단위, 50자 겹침]
    M --> N[MySQLDatabaseService.createKnowledge]
    N --> O[MySQL Knowledge 테이블 저장]
    O --> P[청크별 임베딩 생성]
    
    P --> Q[EmbeddingUtil.createEmbedding<br/>Google Gemini API 호출]
    Q --> R[QdrantService.storeKnowledge]
    R --> S[Qdrant 벡터 DB 저장]
    S --> T[201 Created 응답]
    
    U[사용자 지식 검색 요청] --> V[POST /vector/search-knowledge]
    V --> W[authenticateToken 미들웨어]
    W --> X{토큰 검증}
    X -->|실패| Y[401 Unauthorized]
    X -->|성공| Z[검색 쿼리 검증]
    
    Z --> AA{query 필드 존재?}
    AA -->|없음| BB[400 Bad Request]
    AA -->|존재| CC[EmbeddingUtil.createEmbedding<br/>RETRIEVAL_DOCUMENT 타입]
    
    CC --> DD[QdrantService.searchKnowledge]
    DD --> EE[Qdrant 벡터 유사도 검색]
    EE --> FF[검색 결과 포맷팅]
    FF --> GG[200 OK 응답]
    
    HH[AI 챗봇 RAG 요청] --> II[searchHappytalkGuide 함수 호출]
    II --> JJ[EmbeddingUtil.createEmbedding<br/>RETRIEVAL_QUERY 타입]
    JJ --> KK[QdrantService.searchKnowledge<br/>최대 10개 결과]
    KK --> LL[MySQLDatabaseService.findSearchedKnowledge]
    LL --> MM[지식 문서 내용 반환]
    MM --> NN[Gemini AI 답변 생성]
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Client as 클라이언트
    participant RAGRouter as RAG Router
    participant VectorRouter as Vector Router
    participant Auth as authenticateToken
    participant Upload as upload.single
    participant EmbedUtil as EmbeddingUtil
    participant GeminiAPI as Gemini API
    participant MySQLDB as MySQL Database
    participant QdrantSvc as QdrantService
    participant QdrantDB as Qdrant Database
    participant RAGService as RAG Service
    participant AIBot as AI Chatbot

    Note over User,AIBot: 지식 문서 생성 (텍스트 입력)
    
    User->>Client: 지식 문서 생성 요청 (텍스트)
    Client->>RAGRouter: POST /rag/knowledge/document
    RAGRouter->>Auth: 토큰 인증
    Auth->>Auth: JWT 검증 및 화이트리스트 확인
    Auth-->>RAGRouter: 인증 성공
    
    RAGRouter->>RAGRouter: 파라미터 검증 (content, title, knowledgeType)
    alt 필수 필드 누락
        RAGRouter-->>Client: 400 Bad Request (ERR5000/ERR5001)
    end
    
    RAGRouter->>EmbedUtil: documentChunking(content)
    EmbedUtil->>EmbedUtil: 500자 단위 청크 분할 (50자 겹침)
    EmbedUtil-->>RAGRouter: 청크 배열 반환
    
    RAGRouter->>MySQLDB: createKnowledge(knowledgeData)
    MySQLDB->>MySQLDB: Knowledge 엔티티 생성 및 저장
    MySQLDB-->>RAGRouter: 저장된 지식 문서 반환
    
    loop 각 청크에 대해
        RAGRouter->>EmbedUtil: createEmbedding(chunk, RETRIEVAL_DOCUMENT)
        EmbedUtil->>GeminiAPI: 임베딩 생성 요청
        GeminiAPI-->>EmbedUtil: 1536차원 벡터 반환
        EmbedUtil-->>RAGRouter: 임베딩 벡터
        
        RAGRouter->>QdrantSvc: storeKnowledge(chunk, embedding, metadata)
        QdrantSvc->>QdrantDB: 벡터 저장
        QdrantDB-->>QdrantSvc: 저장 완료
    end
    
    RAGRouter-->>Client: 201 Created (지식 생성 완료)

    Note over User,AIBot: 지식 문서 생성 (파일 업로드)
    
    User->>Client: 지식 문서 생성 요청 (파일)
    Client->>RAGRouter: POST /rag/knowledge/document/file
    RAGRouter->>Auth: 토큰 인증
    Auth-->>RAGRouter: 인증 성공
    RAGRouter->>Upload: 파일 업로드 처리
    Upload->>Upload: 파일 형식 검증 (.txt만 허용)
    alt 파일 업로드 실패
        Upload-->>Client: 400 Bad Request
    end
    Upload-->>RAGRouter: 파일 처리 완료
    
    RAGRouter->>RAGRouter: 파일 내용 UTF-8 변환
    RAGRouter->>RAGRouter: 제목 설정 (title || filename)
    
    Note right of RAGRouter: 이후 과정은 텍스트 입력과 동일

    Note over User,AIBot: 지식 검색
    
    User->>Client: 지식 검색 요청
    Client->>VectorRouter: POST /vector/search-knowledge
    VectorRouter->>Auth: 토큰 인증
    Auth-->>VectorRouter: 인증 성공
    
    VectorRouter->>VectorRouter: 검색 쿼리 검증
    alt query 필드 없음
        VectorRouter-->>Client: 400 Bad Request (ERR1001)
    end
    
    VectorRouter->>EmbedUtil: createEmbedding(query, RETRIEVAL_DOCUMENT)
    EmbedUtil->>GeminiAPI: 쿼리 임베딩 생성
    GeminiAPI-->>EmbedUtil: 쿼리 벡터 반환
    
    VectorRouter->>QdrantSvc: searchKnowledge(queryEmbedding, category, limit)
    QdrantSvc->>QdrantDB: 벡터 유사도 검색
    QdrantDB-->>QdrantSvc: 검색 결과 반환
    QdrantSvc-->>VectorRouter: 포맷팅된 결과
    
    VectorRouter-->>Client: 200 OK (검색 결과)

    Note over User,AIBot: RAG 기반 AI 챗봇 응답
    
    User->>AIBot: AI 챗봇에게 질문
    AIBot->>RAGService: ragChat(messages)
    RAGService->>GeminiAPI: Gemini API 호출 (with function calling)
    GeminiAPI->>RAGService: search_happytalk_guide 함수 호출 필요
    
    RAGService->>RAGService: searchHappytalkGuide 함수 실행
    RAGService->>EmbedUtil: createEmbedding(query, RETRIEVAL_QUERY)
    EmbedUtil->>GeminiAPI: 쿼리 임베딩 생성
    GeminiAPI-->>EmbedUtil: 쿼리 벡터
    
    RAGService->>QdrantSvc: searchKnowledge(queryEmbedding, null, 10)
    QdrantSvc->>QdrantDB: 벡터 검색 (최대 10개)
    QdrantDB-->>QdrantSvc: 검색 결과
    
    loop 각 검색 결과에 대해
        RAGService->>MySQLDB: findSearchedKnowledge(knowledgeId)
        MySQLDB-->>RAGService: 지식 문서 내용
    end
    
    RAGService->>GeminiAPI: 검색된 지식과 함께 최종 답변 생성
    GeminiAPI-->>RAGService: RAG 기반 답변
    RAGService-->>AIBot: 답변 반환
    AIBot-->>User: 지식 기반 답변 제공
```

### Class Diagram

```mermaid
classDiagram
    class RAGRouter {
        +post() createKnowledgeDocument
        +post() createKnowledgeFromFile
        -validateParams()
        -processFileContent()
    }
    
    class VectorRouter {
        +post() searchKnowledge
        -validateQuery()
        -formatResults()
    }
    
    class AuthMiddleware {
        +authenticateToken()
        -verifyJWT()
        -checkWhitelist()
    }
    
    class UploadMiddleware {
        +single(fieldname)
        -fileFilter()
        -storage: memoryStorage
        -limits: {fileSize: 10MB}
    }
    
    class EmbeddingUtil {
        +createEmbedding(text, taskType)
        +documentChunking(document)
        +createBatchEmbeddings()
        -chunkSize: 500
        -overlapSize: 50
        -stepSize: 450
    }
    
    class MySQLDatabaseService {
        +createKnowledge(knowledgeData)
        +findSearchedKnowledge(knowledgeId)
        -getRepository()
    }
    
    class QdrantService {
        +storeKnowledge(content, embedding, metadata)
        +searchKnowledge(queryEmbedding, category, limit)
        +storeVector(vector, payload)
        +searchSimilar(queryVector, limit, filter)
    }
    
    class Knowledge {
        +id: string
        +content: string
        +title: string
        +category: string
        +source: string
        +knowledgeType: enum
        +chunk: json
        +uploaderId: string
        +isDeleted: boolean
        +createdAt: datetime
        +updatedAt: datetime
        +isSync: boolean
    }
    
    class RAGService {
        +ragChat(messages)
        +executeToolFunction(functionCall)
        -callGeminiAPI()
        -handleFunctionCall()
    }
    
    class SearchHappytalkGuide {
        +searchHappytalkGuide(query)
        -processResults()
    }
    
    class GeminiAPI {
        +generateContent()
        +createEmbedding()
        +functionCalling()
    }
    
    class QdrantDatabase {
        +collection: ai_chat_embeddings
        +dimensions: 1536
        +indexedFields: [room_id, user_id, type]
    }
    
    RAGRouter --> AuthMiddleware : uses
    RAGRouter --> UploadMiddleware : uses
    RAGRouter --> EmbeddingUtil : uses
    RAGRouter --> MySQLDatabaseService : uses
    RAGRouter --> QdrantService : uses
    
    VectorRouter --> AuthMiddleware : uses
    VectorRouter --> EmbeddingUtil : uses
    VectorRouter --> QdrantService : uses
    
    EmbeddingUtil --> GeminiAPI : calls
    MySQLDatabaseService --> Knowledge : manages
    QdrantService --> QdrantDatabase : stores
    
    RAGService --> EmbeddingUtil : uses
    RAGService --> QdrantService : uses
    RAGService --> MySQLDatabaseService : uses
    RAGService --> SearchHappytalkGuide : uses
    RAGService --> GeminiAPI : calls
    
    SearchHappytalkGuide --> EmbeddingUtil : uses
    SearchHappytalkGuide --> QdrantService : uses
    SearchHappytalkGuide --> MySQLDatabaseService : uses
```

### 데이터 흐름도

```mermaid
flowchart LR
    A[원본 텍스트/파일] --> B[문서 청킹<br/>500자 단위]
    B --> C[MySQL 저장<br/>Knowledge 테이블]
    B --> D[임베딩 변환<br/>Gemini API]
    D --> E[Qdrant 저장<br/>벡터 컬렉션]
    
    F[사용자 검색 쿼리] --> G[쿼리 임베딩<br/>Gemini API]
    G --> H[벡터 유사도 검색<br/>Qdrant]
    H --> I[메타데이터 조회<br/>MySQL]
    I --> J[검색 결과 반환]
    
    K[AI 챗봇 질문] --> L[Function Calling<br/>Gemini]
    L --> M[지식 검색<br/>searchHappytalkGuide]
    M --> N[벡터 검색<br/>최대 10개]
    N --> O[원본 문서 조회<br/>MySQL]
    O --> P[RAG 답변 생성<br/>Gemini]
```

## 추가 정보

### 지원하는 지식 문서 유형

- **텍스트 입력**: 직접 텍스트를 입력하여 지식 문서 생성
- **파일 업로드**: .txt 파일 업로드 (최대 10MB, UTF-8 인코딩)
- **지식 타입**: 현재 'text' 타입만 지원
- **카테고리**: 사용자 정의 카테고리 분류 지원
- **출처**: 지식 문서의 출처 정보 관리

### 문서 청킹 알고리즘 세부사항

- **청크 크기**: 500자 기준으로 분할
- **겹침 크기**: 인접한 청크 간 50자씩 겹침으로 문맥 보존
- **이동 간격**: 450자씩 이동 (chunkSize - overlapSize)
- **마지막 청크 처리**: 50자 미만인 경우 이전 청크와 병합
- **텍스트 정리**: 연속된 공백 문자를 단일 공백으로 정리

### 임베딩 모델 설정

- **사용 모델**: Google Gemini embedding-exp-03-07
- **벡터 차원**: 1536차원
- **태스크 타입**: 
  - RETRIEVAL_DOCUMENT: 문서 저장용
  - RETRIEVAL_QUERY: 검색 쿼리용
- **출력 차원**: 1536차원으로 고정

### 벡터 데이터베이스 구조

- **컬렉션**: ai_chat_embeddings
- **인덱스 필드**: room_id, user_id, type
- **메타데이터**: knowledgeId, title, category, source, uploaderId
- **검색 방식**: 코사인 유사도 기반

### 보안 및 접근 제어

- **인증**: JWT Bearer 토큰 기반
- **토큰 검증**: 화이트리스트 기반 이중 검증
- **사용자 격리**: uploaderId를 통한 사용자별 지식 관리
- **파일 업로드 보안**: 
  - 파일 형식 제한 (.txt만 허용)
  - 파일 크기 제한 (최대 10MB)
  - 메모리 저장으로 임시 파일 생성 방지

### 성능 최적화

- **배치 임베딩**: 여러 청크를 동시에 처리
- **벡터 인덱싱**: Qdrant의 HNSW 인덱스 활용
- **데이터베이스 인덱스**: uploaderId, createdAt 필드 인덱싱
- **청크 기반 검색**: 문서 전체가 아닌 관련 청크만 검색

### RAG 통합 방식

- **Function Calling**: Gemini AI의 function calling 기능 활용
- **도구 정의**: llm-rag-tools.json에 검색 도구 정의
- **시스템 프롬프트**: Happytalk 솔루션 전용 어시스턴트 역할 정의
- **검색 결과 활용**: 최대 10개의 관련 문서를 기반으로 답변 생성
- **참고 문서 표시**: 답변에 참고한 문서의 ID 포함

### 에러 처리 및 모니터링

- **에러 코드**: 
  - ERR5000: 필수 필드 누락
  - ERR5001: 학습 타입 미정의
  - ERR1001: 검색 쿼리 누락
  - ERR1008: 인증 토큰 오류
- **로깅**: 각 단계별 상세 로그 기록
- **모니터링**: API 호출, 임베딩 생성, 벡터 저장 성공률 추적