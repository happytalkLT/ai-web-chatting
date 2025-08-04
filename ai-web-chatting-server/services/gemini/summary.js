const {getGeminiApiUrl} = require("../../constants/gemini");
const MySQLDatabaseService = require('../mysql-database');

const systemInstruction = `
## 제한 사항
- 작업 내용 및 범위는 *반드시* 지시된 내용만 수행합니다.
- SUMMARY_PATTERN:<summary> //summary of the conversation </summary>
## 목표
- 당신은 전달받는 대화 원문을 문맥을 인지 할 수 있는 내용만 판단하여 요약문을 제공해야 합니다.
- 답변은 XML 데이터로 전달하며 SUMMARY_PATTERN에 *일치*하도록 하세요.
`

async function callGeminiAPI(contents, apiKey, endpoint = 'GENERATE_CONTENT') {
  const response = await fetch(getGeminiApiUrl(endpoint), {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{text: systemInstruction}]
      },
      contents: contents
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
  }

  return await response.json();
}

async function getNotSummaries(roomId) {
  const chatMessages = await MySQLDatabaseService.getNotSummaryMessagesByRoom(roomId);
  return chatMessages;
}

async function saveSummary(roomId, userId, summary) {
  await MySQLDatabaseService.createChatSummary({
    chatRoomId: roomId,
    senderId: userId,  // Changed from userId to senderId to match entity
    content: summary,  // Changed from summary to content to match entity
    createdAt: new Date()
  });
}

async function summary(roomId, userId) {
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const summaryTargetContent = await getNotSummaries(roomId);
    
    // 반환된 메시지가 50개가 아니면 summary 함수를 실행하지 않음
    if (!summaryTargetContent || summaryTargetContent.length !== 50) {
      console.log(`Summary not executed: message count is ${summaryTargetContent?.length || 0}, expected 50`);
      return null;
    }

    // 메시지 내용을 Gemini API 형식으로 변환
    const contents = [{
      parts: [{
        text: summaryTargetContent.map(msg => `${msg.sender?.name || 'Unknown'}: ${msg.content}`).join('\n')
      }]
    }];

    const data = await callGeminiAPI(contents, apiKey);
    
    if (roomId && userId && data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const summaryText = data.candidates[0].content.parts[0].text;
      await saveSummary(roomId, userId, summaryText);
      return summaryText;
    }
    return null;
  } catch (error) {
    console.error('Error calling Gemini API with tools:', error);
    throw error;
  }
}

module.exports = {
  summary
};