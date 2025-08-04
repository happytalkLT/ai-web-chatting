# AI Web Chatting

## 구현 언어
- **Backend:** JavaScript/Node.js
- **Frontend:** TypeScript, React, Next.js
- **Database:** MySQL (TypeORM)
- **Styling:** Tailwind CSS

## 각 서버 행위와 목적

### 1. AI Web Chatting Server
- **목적:** 인증, 채팅, AI 통합, 벡터 DB 작업을 처리하는 메인 API 서버
- **주요 기능:** 
  - 사용자 인증 (JWT)
  - Google Gemini를 활용한 AI 채팅
  - RAG (Retrieval-Augmented Generation) 지원
  - Socket.io를 통한 실시간 통신
  - Qdrant 벡터 데이터베이스 연동

### 2. AI Web Chatting Frontend
- **목적:** 사용자 인터페이스를 제공하는 Next.js 웹 애플리케이션
- **주요 기능:**
  - 로그인/회원가입 페이지
  - 채팅방 관리 대시보드
  - 실시간 채팅 인터페이스
  - RAG 데모 기능

### 3. AI Web Chatting Daemon
- **목적:** 비동기 처리를 위한 백그라운드 서비스
- **주요 기능:**
  - 지식 문서 처리
  - Google Gemini를 사용한 임베딩 생성
  - Bull 큐를 사용한 백그라운드 작업 처리
  - Redis 기반 작업 큐 관리

## 서버 포트
- **메인 서버:** 3000
- **프론트엔드:** 3033
- **데몬 서버:** 3001
- **Redis:** 6379
- **Qdrant:** 6333

## 라우터

### 사용자 관리
- `POST /users/signup` - 회원가입
- `POST /users/login` - 로그인
- `POST /users/logout` - 로그아웃
- `POST /users/refresh` - JWT 토큰 갱신
- `GET /users/me` - 현재 사용자 정보
- `PUT /users/profile` - 프로필 업데이트
- `DELETE /users/account` - 계정 삭제

### AI 채팅
- `POST /ai/chat` - Gemini 멀티턴 채팅
- `POST /ai/chat/tool` - 함수 호출 채팅
- `POST /ai/chat/rag` - RAG 채팅

### 벡터 데이터베이스
- `POST /vector/store-message` - 메시지 임베딩 저장
- `POST /vector/search-similar` - 유사 메시지 검색
- `POST /vector/search-knowledge` - 지식 베이스 검색
- `GET /vector/collection-info` - 컬렉션 정보 조회

### 채팅방
- `POST /room` - 채팅방 생성
- `GET /room` - 사용자 채팅방 목록

### RAG (지식 관리)
- `POST /rag/knowledge/document` - 지식 문서 생성
- `POST /rag/knowledge/document/file` - 파일 업로드로 지식 생성

## 실행 방법

### 1. 의존성 설치
```bash
cd ai-web-chatting-server && npm install
cd ../ai-web-chatting-front && npm install
cd ../ai-web-chatting-daemon && npm install
```

### 2. 환경 변수 설정
각 디렉토리의 `.env.example` 파일을 `.env`로 복사하고 설정

### 3. 인프라 서비스 실행
```bash
cd ai-web-chatting-daemon
docker-compose up -d  # Redis 실행
```

### 4. 서버 실행
```bash
# 터미널 1: 메인 서버
cd ai-web-chatting-server
npm start

# 터미널 2: 데몬
cd ai-web-chatting-daemon
npm start

# 터미널 3: 프론트엔드
cd ai-web-chatting-front
npm run dev
```

### 5. 애플리케이션 접속
- http://localhost:3033