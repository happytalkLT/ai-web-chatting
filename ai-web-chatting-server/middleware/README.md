# 인증 미들웨어 사용 가이드

## 1. authenticateToken 미들웨어

JWT 토큰을 검증하고 사용자 정보를 `req.user`에 추가합니다.

### 사용 방법

```javascript
const { authenticateToken } = require('../middleware/auth');

// 개별 라우트에 적용
router.get('/protected', authenticateToken, (req, res) => {
  // req.user에서 사용자 정보 접근 가능
  console.log(req.user.userId);
  console.log(req.user.email);
  console.log(req.user.name);
});

// 라우터 전체에 적용
router.use(authenticateToken);

// 특정 경로에만 적용
router.use('/admin/*', authenticateToken);
```

### 클라이언트 요청 형식

```bash
GET /api/protected
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. optionalAuth 미들웨어

토큰이 있으면 검증하고, 없어도 통과시킵니다.

```javascript
const { optionalAuth } = require('../middleware/auth');

router.get('/posts', optionalAuth, (req, res) => {
  if (req.user) {
    // 로그인한 사용자
    console.log('Logged in user:', req.user.email);
  } else {
    // 비로그인 사용자
    console.log('Anonymous user');
  }
});
```

## 3. requireRole 미들웨어

특정 역할을 가진 사용자만 접근 가능합니다.

```javascript
const { authenticateToken, requireRole } = require('../middleware/auth');

// 관리자만 접근 가능
router.get('/admin', authenticateToken, requireRole(['admin']), handler);

// 관리자 또는 모더레이터만 접근 가능
router.get('/manage', authenticateToken, requireRole(['admin', 'moderator']), handler);
```

## 에러 응답

인증 실패 시 다음과 같은 응답이 반환됩니다:

```json
{
  "success": false,
  "errorCode": "ERR1008",
  "message": "유효하지 않은 토큰입니다.",
  "statusCode": 401
}
```

## 토큰 만료 처리

Access Token이 만료된 경우:
1. 401 에러와 함께 "토큰이 만료되었습니다." 메시지 반환
2. 클라이언트는 Refresh Token으로 새 Access Token 요청
3. `/users/refresh` 엔드포인트 사용

```javascript
// 토큰 갱신 요청
POST /users/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```