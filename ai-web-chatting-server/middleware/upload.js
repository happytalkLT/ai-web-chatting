const multer = require('multer');

// 메모리 스토리지 사용 - 파일을 디스크에 저장하지 않고 메모리에서 직접 처리
const storage = multer.memoryStorage();

// Multer 설정
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    // .txt 파일만 허용
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('텍스트 파일(.txt)만 업로드 가능합니다.'), false);
    }
  }
});

module.exports = upload;