# 현재 사용자 정보 조회 API

## 개요

인증된 사용자의 현재 정보를 조회하는 API입니다. JWT 토큰을 통해 인증된 사용자의 상세 정보를 반환하며, 보안을 위해 비밀번호는 응답에서 제외됩니다. 이 API는 사용자가 자신의 프로필 정보를 확인하거나 프론트엔드에서 사용자 인증 상태를 확인할 때 사용됩니다.

## Request

### Endpoint

| Method | Path |
|---|---|
| GET | /users/me |

### Path Parameters

| 파라미터 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| - | - | - | 경로 파라미터 없음 |

### Query Parameters

| 파라미터 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| - | - | - | 쿼리 파라미터 없음 |

### Request Headers

| 헤더 | 필수 여부 | 설명 |
|---|---|---|
| Authorization | 필수 | Bearer 토큰 형식의 JWT 액세스 토큰 (예: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...") |
| Content-Type | 권장 | application/json |

### Request Body

| 파라미터 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| - | - | - | 요청 본문 없음 |

### 인증 방식

이 API는 JWT (JSON Web Token) 기반의 Bearer 토큰 인증을 사용합니다.

1. **토큰 형식**: Authorization 헤더에 "Bearer {token}" 형식으로 전송
2. **토큰 검증 과정**:
   - JWT 서명 유효성 검증 (`jwtUtil.verifyAccessToken`)
   - 데이터베이스 화이트리스트 검증 (`MySQLDatabaseService.findActiveToken`)
   - 토큰 만료 시간 확인
3. **토큰 정보**: 토큰에는 사용자 ID, 이메일, 이름 정보가 포함됨
4. **인증 실패 시**: ERR1008 에러 코드와 함께 401 Unauthorized 응답

## Response

### Response Status

| HTTP Status | 설명 |
|---|---|
| 200 | 성공적으로 사용자 정보를 조회함 |
| 401 | 인증 실패 (토큰 누락, 만료, 유효하지 않음) |
| 404 | 사용자를 찾을 수 없음 |
| 500 | 서버 내부 오류 |

### Response Headers

| 헤더 | 필수 여부 | 설명 |
|---|---|---|
| Content-Type | 필수 | application/json |

### Response Body

#### 성공 응답 (200 OK)

| 필드 | 타입 | 설명 |
|---|---|---|
| success | boolean | 요청 성공 여부 (항상 true) |
| message | string | 응답 메시지 ("사용자 정보를 조회했습니다.") |
| data | object | 응답 데이터 객체 |
| data.user | object | 사용자 정보 객체 |
| data.user.id | string | 사용자 고유 식별자 (UUID 형식) |
| data.user.email | string | 사용자 이메일 주소 |
| data.user.name | string | 사용자 이름 |
| data.user.profileImage | string \| null | 프로필 이미지 URL (선택적) |
| data.user.isActive | boolean | 사용자 활성 상태 |
| data.user.lastLoginAt | string \| null | 마지막 로그인 시간 (ISO 8601 형식) |
| data.user.createdAt | string | 계정 생성 시간 (ISO 8601 형식) |
| data.user.updatedAt | string | 계정 정보 마지막 수정 시간 (ISO 8601 형식) |

#### 실패 응답

| 필드 | 타입 | 설명 |
|---|---|---|
| success | boolean | 요청 성공 여부 (항상 false) |
| errorCode | string | 에러 코드 |
| message | string | 에러 메시지 |
| statusCode | number | HTTP 상태 코드 |

### Error Code

| 코드 | 설명 |
|---|---|
| ERR1008 | 토큰 관련 오류 (토큰 누락, 만료, 유효하지 않음, 화이트리스트에 없음) |
| ERR1006 | 사용자를 찾을 수 없음 (토큰은 유효하지만 해당 사용자가 데이터베이스에 존재하지 않음) |
| ERR0000 | 서버 내부 오류 (데이터베이스 연결 실패, 예상치 못한 에러 등) |

### Hooks(Callbacks)

이 API는 외부 시스템으로 훅 이벤트를 발생시키지 않습니다.

## Flow

### Flow Chart

```mermaid
flowchart TD
    A[클라이언트 요청] --> B[authenticateToken 미들웨어]
    B --> C{Authorization 헤더 존재?}
    C -->|아니오| D[ERR1008 에러 반환]
    C -->|예| E[Bearer 토큰 추출]
    E --> F[jwtUtil.verifyAccessToken 호출]
    F --> G{JWT 토큰 유효?}
    G -->|아니오| H[토큰 에러 반환]
    G -->|예| I[MySQLDatabaseService.findActiveToken 호출]
    I --> J{화이트리스트에 토큰 존재?}
    J -->|아니오| K[ERR1008 에러 반환]
    J -->|예| L[req.user에 사용자 정보 설정]
    L --> M[라우트 핸들러 실행]
    M --> N[MySQLDatabaseService.getUserById 호출]
    N --> O{사용자 존재?}
    O -->|아니오| P[ERR1006 에러 반환]
    O -->|예| Q[비밀번호 제거]
    Q --> R[createSuccessResponse 호출]
    R --> S[200 응답 반환]
    
    D --> T[401 응답]
    H --> U[401 응답]
    K --> V[401 응답]
    P --> W[404 응답]
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant C as 클라이언트
    participant M as authenticateToken 미들웨어
    participant J as JWT Utils
    participant DB as MySQL Database
    participant R as 라우트 핸들러

    C->>M: GET /users/me (Authorization: Bearer token)
    M->>M: Authorization 헤더 검증
    M->>J: verifyAccessToken(token)
    J-->>M: decoded user info
    M->>DB: findActiveToken(token)
    DB-->>M: token record
    M->>M: req.user 설정
    M->>R: next()
    
    R->>DB: getUserById(req.user.userId)
    DB-->>R: user data
    R->>R: 비밀번호 제거 (password: _)
    R->>R: createSuccessResponse(userResponse)
    R-->>C: 200 OK {success: true, data: {user: {...}}}
    
    Note over C,R: 에러 케이스
    alt 토큰 없음/유효하지 않음
        M-->>C: 401 Unauthorized (ERR1008)
    else 사용자 없음
        R-->>C: 404 Not Found (ERR1006)
    else 서버 오류
        R-->>C: 500 Internal Server Error (ERR0000)
    end
```

### Class Diagram

```mermaid
classDiagram
    class AuthMiddleware {
        +authenticateToken(req, res, next)
        -extractToken(authHeader) string
        -verifyTokenInWhitelist(token) Promise~TokenRecord~
    }

    class JWTUtil {
        +verifyAccessToken(token) DecodedToken
        -validateSignature(token) boolean
        -checkExpiration(token) boolean
    }

    class MySQLDatabaseService {
        +getUserById(id) Promise~User~
        +findActiveToken(token) Promise~TokenRecord~
        -getRepository(entity) Repository
    }

    class UserRouteHandler {
        +handleGetCurrentUser(req, res) Promise~void~
        -removePasswordFromResponse(user) UserResponse
        -createSuccessResponse(data, message) SuccessResponse
        -createErrorResponse(errorCode) ErrorResponse
    }

    class User {
        +id: string
        +email: string
        +password: string
        +name: string
        +profileImage: string
        +isActive: boolean
        +lastLoginAt: Date
        +createdAt: Date
        +updatedAt: Date
    }

    class TokenRecord {
        +id: string
        +token: string
        +userId: string
        +expiresAt: Date
        +isActive: boolean
    }

    AuthMiddleware --> JWTUtil : uses
    AuthMiddleware --> MySQLDatabaseService : uses
    UserRouteHandler --> MySQLDatabaseService : uses
    MySQLDatabaseService --> User : returns
    MySQLDatabaseService --> TokenRecord : returns
```

## 추가 정보

### 보안 고려사항

1. **비밀번호 제거**: 응답에서 사용자의 비밀번호는 자동으로 제거됩니다 (`const { password: _, ...userResponse } = user`)
2. **토큰 화이트리스트**: JWT 검증 외에 데이터베이스 화이트리스트를 통한 추가 검증 수행
3. **토큰 만료**: 액세스 토큰의 만료 시간은 1시간으로 설정됨

### 성능 최적화

1. **인덱스 활용**: User 엔티티의 기본 키 인덱스를 통한 빠른 조회
2. **캐싱 고려사항**: 자주 조회되는 사용자 정보의 경우 Redis 캐싱 도입 검토 가능

### 데이터베이스 스키마

- **테이블**: users
- **기본 키**: id (UUID, varchar(36))
- **인덱스**: IDX_USER_EMAIL, IDX_USER_CREATED_AT
- **관계**: Token 테이블과 userId로 연결

### 에러 처리 패턴

모든 에러는 `createErrorResponse` 함수를 통해 표준화된 형태로 반환되며, 각 에러 코드는 적절한 HTTP 상태 코드와 매핑됩니다.

### 토큰 관리

- **액세스 토큰**: 1시간 유효
- **리프레시 토큰**: 7일 유효
- **토큰 정리**: 6시간마다 만료된 토큰 자동 정리 (`tokenCleanup.js`)