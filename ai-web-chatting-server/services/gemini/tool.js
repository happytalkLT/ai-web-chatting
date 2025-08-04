const { getGeminiApiUrl } = require('../../constants/gemini');
const toolDefinitions = require('../tool/llm-tools.json');

const toolFunctions = {
  get_current_time: require('../tool/getCurrentTime'),
  get_search_local: require('../tool/getSearchLocal')
};

async function executeToolFunction(functionCall) {
  const toolFunction = toolFunctions[functionCall.name];
  
  if (!toolFunction) {
    return { error: `Function ${functionCall.name} not found` };
  }
  
  try {
    return await toolFunction(functionCall.args);
  } catch (error) {
    console.error(`Error executing ${functionCall.name}:`, error);
    return { error: error.message };
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

async function handleFunctionCall(data, contents, apiKey, useStream) {
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
          response: functionResult
        }
      }]
    }
  ];

  return await callGeminiAPI(updatedContents, apiKey, useStream);
}

async function toolChat(messages, endpoint = 'GENERATE_CONTENT') {

  // Convert frontend format to Gemini API format
  const contents = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [
      {
        text: msg.text
      }
    ]
  }));

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  try {
    const data = await callGeminiAPI(contents, apiKey, endpoint);
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
      return await handleFunctionCall(data, contents, apiKey, endpoint);
    }
    
    return data;
  } catch (error) {
    console.error('Error calling Gemini API with tools:', error);
    throw error;
  }
}

module.exports = { toolChat };