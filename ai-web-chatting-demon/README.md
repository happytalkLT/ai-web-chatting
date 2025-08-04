# AI Web Chatting Demon Server

Knowledge 데이터의 임베딩 처리를 담당하는 데몬 서버입니다.

## 주요 기능

- Knowledge 데이터의 chunk를 주기적으로 확인
- Gemini text-embedding-004 모델을 사용한 임베딩 생성
- Qdrant 벡터 DB에 임베딩 저장
- Bull 큐를 이용한 처리량 제한 관리
- node-cron을 이용한 주기적 처리

## 시작하기

### 1. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 설정합니다:

```bash
cp .env.example .env
```

주요 환경 변수:
- `GEMINI_API_KEY`: Gemini API 키
- `QDRANT_URL`: Qdrant 서버 URL
- `DB_*`: MySQL 데이터베이스 연결 정보
- `CRON_SCHEDULE`: 크론 스케줄 (기본값: */5 * * * *)

### 2. Redis 실행

```bash
docker-compose up -d
```

### 3. 서버 실행

```bash
npm start
```

또는 개발 모드로 실행:

```bash
npm run dev
```

## API 엔드포인트

- `GET /health`: 서버 상태 확인
- `GET /queue/status`: 큐 상태 확인

## 아키텍처

1. **Cron Job**: 5분마다 실행되어 미처리된 Knowledge 확인
2. **Bull Queue**: Gemini API 처리량 제한 관리
3. **Embedding Worker**: 큐에서 작업을 가져와 임베딩 생성 및 저장
4. **Batch Processing**: 여러 텍스트를 한 번에 임베딩 처리하여 효율성 향상