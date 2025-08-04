const {getGeminiApiUrl} = require("../../constants/gemini");
const toolDefinitions = require('../tool/llm-rag-tools.json');
const MySQLDatabaseService = require('../mysql-database');

let systemInstruction = `
<goal>
- 당신은 Happytalk 솔루션의 정보를 제공 하기 위한 어시스턴트 입니다.
- 주어진 정보와 도구들을 적절히 사용하여 사용자가 도움을 제공 받을 수 있도록 성심 성의것 답변을 해주세요.
</goal>

<guideline>
- 참고한 문서의 id 값도 응답에 포함하여 전달하세요.
- 제공되는 문서는 최대 10개의 문서가 있으며 사용자의 질문에 대한 정답을 제공하세요.
- 형식은 Markdown 문법으로 제공 되며, 답변 최하단은 참고 문서를 표시 하도록 하세요.
</guideline>

`;

const toolFunctions = {
  search_happytalk_guide: require('../tool/searchHappytalkGuide'),
};


async function executeToolFunction(functionCall) {
  const toolFunction = toolFunctions[functionCall.name];

  if (!toolFunction) {
    return {error: `Function ${functionCall.name} not found`};
  }

  try {
    return await toolFunction(functionCall.args);
  } catch (error) {
    console.error(`Error executing ${functionCall.name}:`, error);
    return {error: error.message};
  }
}

async function ragChat(roomId, summary) {
  if (summary) {
    systemInstruction += summary
  }
  
  let contents;
  
  if (roomId) {
    // DB에서 메시지 조회 - isDeleted: false, isSummary: false인 메시지만
    const messages = await MySQLDatabaseService.getMessagesByRoom(roomId);
    const filteredMessages = messages.filter(msg => !msg.isSummary);
    
    // 메시지를 시간순으로 정렬 (오래된 것부터)
    filteredMessages.reverse();
    
    // contents 가공 - messageType에 따라 role 설정
    contents = filteredMessages.map(msg => ({
      role: msg.messageType === 'text' ? 'user' : msg.messageType === 'model' ? 'model' : 'user',
      parts: [
        {
          text: msg.content
        }
      ]
    }));
  } else {
    // roomId가 없는 경우 기존 로직 유지 (에러 처리)
    throw new Error('roomId is required for ragChat');
  }

  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const data = await callGeminiAPI(contents, apiKey);

    if (data.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
      return await handleFunctionCall(data, contents, apiKey);
    }

    return data;
  } catch (error) {
    console.error('Error calling Gemini API with tools:', error);
    throw error;
  }
}


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
      contents: contents,
      tools: [
        {
          functionDeclarations: toolDefinitions
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
  }

  return await response.json();
}


async function handleFunctionCall(data, contents, apiKey) {
  const functionCall = data.candidates[0].content.parts[0].functionCall;
  console.log('Function call detected:', functionCall);

  const functionResult = await executeToolFunction(functionCall);
  const updatedContents = [
    ...contents,
    data.candidates[0].content,
    {
      role: 'user',
      parts: [{
        functionResponse: {
          name: functionCall.name,
          response: {functionResult}
        }
      }]
    }
  ];
  console.log(updatedContents)
  return await callGeminiAPI(updatedContents, apiKey);
}

module.exports = {ragChat}