# Chat with function calling

## 개요

Google Gemini AI 모델을 활용한 대화형 AI 채팅 서비스로, 함수 호출(Function Calling) 기능을 지원합니다. 사용자의 메시지에 따라 AI가 특정 도구나 함수를 호출하여 실시간 정보를 제공할 수 있으며, 현재 시간 조회, 네이버 지역 검색 등의 기능을 제공합니다. 이 API는 단일 요청으로 다중 턴 대화를 처리하며, AI가 필요에 따라 도구를 호출한 후 그 결과를 바탕으로 최종 응답을 생성합니다.

## Request

### Endpoint

| Method | Path |
|--------|------|
| POST | /ai/chat/tool |

### Path Parameters

해당 API는 Path Parameter를 사용하지 않습니다.

| 파라미터 | 타입 | 필수 여부 | 설명 |
|----------|------|-----------|------|
| - | - | - | Path Parameter 없음 |

### Query Parameters

해당 API는 Query Parameter를 사용하지 않습니다.

| 파라미터 | 타입 | 필수 여부 | 설명 |
|----------|------|-----------|------|
| - | - | - | Query Parameter 없음 |

### Request Headers

| 헤더 | 필수 여부 | 설명 |
|------|-----------|------|
| Content-Type | 필수 | application/json |
| Authorization | 선택 | Bearer {access_token} (인증 미들웨어가 적용되지 않아 선택적) |

### Request Body

| 파라미터 | 타입 | 필수 여부 | 설명 |
|----------|------|-----------|------|
| messages | Array | 필수 | 대화 메시지 배열 |
| messages[].role | String | 필수 | 메시지 역할 ('user' 또는 'assistant') |
| messages[].text | String | 필수 | 메시지 내용 |

### 인증 방식

현재 이 API는 인증 미들웨어가 적용되지 않아 인증 없이도 호출 가능합니다. 하지만 Authorization 헤더를 포함하여 요청할 경우 JWT Bearer 토큰을 사용할 수 있습니다. JWT 토큰은 화이트리스트 방식으로 관리되며, 토큰의 유효성과 만료 시간을 검증합니다.

## Response

### Response Status

| HTTP Status | 설명 |
|-------------|------|
| 200 | 요청 성공 |
| 400 | 잘못된 요청 (messages 배열 누락 또는 형식 오류) |
| 500 | 서버 내부 오류 (Gemini API 호출 실패, 도구 실행 오류 등) |

### Response Headers

| 헤더 | 필수 여부 | 설명 |
|------|-----------|------|
| Content-Type | 필수 | application/json |
| Access-Control-Allow-Origin | 필수 | * (CORS 설정) |
| Access-Control-Allow-Methods | 필수 | GET, POST, PUT, DELETE, OPTIONS |
| Access-Control-Allow-Headers | 필수 | Origin, X-Requested-With, Content-Type, Accept, Authorization |

### Response Body

정상 응답 시 Gemini API의 응답 구조를 그대로 반환합니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| candidates | Array | AI 응답 후보 배열 |
| candidates[].content | Object | 응답 내용 객체 |
| candidates[].content.role | String | 응답 역할 ('model') |
| candidates[].content.parts | Array | 응답 부분 배열 |
| candidates[].content.parts[].text | String | AI가 생성한 텍스트 응답 |
| candidates[].finishReason | String | 응답 완료 이유 |
| candidates[].safetyRatings | Array | 안전성 평가 배열 |
| usageMetadata | Object | 사용량 메타데이터 |
| usageMetadata.promptTokenCount | Number | 프롬프트 토큰 수 |
| usageMetadata.candidatesTokenCount | Number | 응답 토큰 수 |
| usageMetadata.totalTokenCount | Number | 총 토큰 수 |

오류 응답 시:

| 필드 | 타입 | 설명 |
|------|------|------|
| error | String | 오류 메시지 |

### Error code

| 코드 | 설명 |
|------|------|
| 400 | messages array is required - messages 파라미터가 누락되었거나 배열이 아님 |
| 500 | Internal server error - Gemini API 호출 실패, 환경변수 누락, 도구 실행 오류 등 |

### Hooks(Callbacks)

이 API는 외부 시스템으로의 Hook이나 Callback을 발생시키지 않습니다. 단, 내부적으로 함수 호출 시 다음과 같은 외부 API 호출이 발생할 수 있습니다:

#### get_search_local 도구 호출 시

**Request:**
- Method: GET
- URL: https://openapi.naver.com/v1/search/local.json
- Headers:
  - X-Naver-Client-Id: {NAVER_APPLICATION_CLIENT_ID}
  - X-Naver-Client-Secret: {NAVER_APPLICATION_CLIENT_SECRET}
- Query Parameters:
  - query: 검색어
  - display: 5 (고정값)
  - start: 1 (고정값)
  - sort: random (고정값)

## Flow

### Flow Chart

```mermaid
flowchart TD
    A[API 요청 시작] --> B{messages 배열 검증}
    B -->|실패| C[400 에러 반환]
    B -->|성공| D[메시지 형식 변환<br/>toolChat 함수 호출]
    D --> E[GEMINI_API_KEY 환경변수 확인]
    E -->|누락| F[500 에러 반환]
    E -->|존재| G[Gemini API 호출<br/>callGeminiAPI 함수]
    G --> H{도구 정의와 함께<br/>Gemini API 응답 분석}
    H -->|함수 호출 없음| I[일반 AI 응답 반환]
    H -->|함수 호출 있음| J[handleFunctionCall 함수 호출]
    J --> K[함수 실행<br/>executeToolFunction]
    K --> L{도구 함수 존재 확인}
    L -->|없음| M[에러 응답 생성]
    L -->|있음| N{도구 타입 확인}
    N -->|get_current_time| O[getCurrentTime 함수 실행]
    N -->|get_search_local| P[getSearchLocal 함수 실행<br/>네이버 API 호출]
    O --> Q[함수 실행 결과]
    P --> Q
    M --> Q
    Q --> R[대화 히스토리에<br/>함수 결과 추가]
    R --> S[업데이트된 대화로<br/>Gemini API 재호출]
    S --> T[최종 AI 응답 생성]
    T --> U[200 응답 반환]
    G -->|API 오류| V[500 에러 반환]
    P -->|네이버 API 오류| W[도구 실행 오류]
    W --> Q
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant Router as AI Router
    participant ToolService as Tool Service
    participant GeminiAPI as Gemini API
    participant NaverAPI as Naver API
    participant TimeService as Time Service

    Client->>Router: POST /ai/chat/tool
    Note over Client,Router: { messages: [{role, text}] }
    
    Router->>Router: messages 배열 유효성 검증
    alt messages 유효하지 않음
        Router->>Client: 400 Bad Request
    end
    
    Router->>ToolService: toolChat(messages)
    ToolService->>ToolService: 메시지 형식 변환 (frontend → Gemini)
    ToolService->>ToolService: GEMINI_API_KEY 환경변수 확인
    
    alt API 키 누락
        ToolService->>Router: Error: API key not set
        Router->>Client: 500 Internal Server Error
    end
    
    ToolService->>GeminiAPI: callGeminiAPI(contents, apiKey)
    Note over ToolService,GeminiAPI: tools: [functionDeclarations]
    
    GeminiAPI->>ToolService: API 응답
    
    alt 함수 호출이 포함된 응답
        ToolService->>ToolService: handleFunctionCall 호출
        ToolService->>ToolService: executeToolFunction 호출
        
        alt get_current_time 호출
            ToolService->>TimeService: getCurrentTime(params)
            TimeService->>ToolService: 시간 정보 반환
        else get_search_local 호출
            ToolService->>NaverAPI: 지역검색 API 호출
            NaverAPI->>ToolService: 검색 결과 반환
        end
        
        ToolService->>ToolService: 대화 히스토리에 함수 결과 추가
        ToolService->>GeminiAPI: 업데이트된 대화로 재호출
        GeminiAPI->>ToolService: 최종 AI 응답
    end
    
    ToolService->>Router: Gemini API 응답 데이터
    Router->>Client: 200 OK + AI 응답
    
    alt 에러 발생
        ToolService->>Router: Error
        Router->>Client: 500 Internal Server Error
    end
```

### Class Diagram

```mermaid
classDiagram
    class AIRouter {
        +post("/chat/tool")
        -validateMessages(req.body)
        -handleError(error, res)
    }
    
    class ToolService {
        +toolChat(messages, endpoint)
        -callGeminiAPI(contents, apiKey, endpoint)
        -handleFunctionCall(data, contents, apiKey, useStream)
        -executeToolFunction(functionCall)
    }
    
    class ToolDefinitions {
        +get_current_time: Object
        +get_search_local: Object
    }
    
    class ToolFunctions {
        +get_current_time: Function
        +get_search_local: Function
    }
    
    class GetCurrentTime {
        +getCurrentTime(params)
        -locationToTimezone: Map
        -formatTime(timezone, location)
    }
    
    class GetSearchLocal {
        +gerSearchLocal(params)
        -validateCredentials()
        -buildSearchParams(query)
        -callNaverAPI(params)
    }
    
    class GeminiAPI {
        +GENERATE_CONTENT: String
        +BASE_URL: String
        +MODEL: Object
        +ENDPOINTS: Object
    }
    
    class ErrorCodes {
        +ERROR_CODES: Object
        +ERROR_MESSAGES: Object
        +createErrorResponse(code, message)
    }
    
    AIRouter --> ToolService : uses
    ToolService --> ToolDefinitions : imports
    ToolService --> ToolFunctions : uses
    ToolService --> GeminiAPI : calls
    ToolFunctions --> GetCurrentTime : contains
    ToolFunctions --> GetSearchLocal : contains
    GetSearchLocal --> NaverAPI : calls
    AIRouter --> ErrorCodes : uses
    ToolService --> ErrorCodes : uses
```

## 추가 정보

### 지원되는 도구 함수

#### 1. get_current_time
- **목적**: 특정 지역의 현재 시간 조회
- **파라미터**: location (도시명, 국가명, 또는 시간대)
- **지원 지역**: 전 세계 주요 도시 및 국가 (63개 지역 매핑)
- **응답 형식**: 한국어 형식의 시간 정보

#### 2. get_search_local
- **목적**: 네이버 지역 검색을 통한 장소/업체 정보 검색
- **파라미터**: query (검색어)
- **검색 옵션**: display=5, start=1, sort=random
- **필요 환경변수**: NAVER_APPLICATION_CLIENT_ID, NAVER_APPLICATION_CLIENT_SECRET

### 환경변수 요구사항

- `GEMINI_API_KEY`: Google Gemini AI API 키 (필수)
- `NAVER_APPLICATION_CLIENT_ID`: 네이버 개발자센터 클라이언트 ID (get_search_local 도구 사용 시 필요)
- `NAVER_APPLICATION_CLIENT_SECRET`: 네이버 개발자센터 클라이언트 시크릿 (get_search_local 도구 사용 시 필요)

### 함수 호출 처리 과정

1. 사용자 메시지 분석 후 함수 호출 필요성 판단
2. 함수 호출 시 해당 도구 실행
3. 도구 실행 결과를 대화 히스토리에 추가
4. 업데이트된 히스토리로 Gemini API 재호출
5. 최종 자연어 응답 생성

### 에러 처리 특징

- 도구 함수 실행 실패 시에도 에러 정보를 포함하여 대화 진행
- 네이버 API 호출 실패 시 구체적인 에러 메시지 반환
- Gemini API 호출 실패 시 상세한 오류 정보 로깅

### 성능 고려사항

- 함수 호출이 있는 경우 최소 2번의 Gemini API 호출 발생
- 네이버 API 호출 시 추가 네트워크 지연 발생 가능
- 토큰 사용량은 함수 호출 결과까지 포함하여 계산됨