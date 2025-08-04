-- ChatMessage messageType enum에 'model' 값 추가

-- 현재 enum 값 확인
SHOW COLUMNS FROM chat_messages LIKE 'messageType';

-- enum 값 업데이트 (기존 값들 + 'model' 추가)
ALTER TABLE chat_messages 
MODIFY COLUMN messageType ENUM('text', 'image', 'file', 'system', 'model') DEFAULT 'text';

-- 업데이트 확인
SHOW COLUMNS FROM chat_messages LIKE 'messageType';