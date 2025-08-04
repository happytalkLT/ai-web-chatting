const GEMINI_API = {
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  MODEL: {GEMINI_2_5_FLASH: 'gemini-2.5-flash', EMBEDDING: 'gemini-embedding-001'},
  ENDPOINTS: {
    GENERATE_CONTENT: 'generateContent',
    STREAM_GENERATE_CONTENT: 'streamGenerateContent',
    EMBEDDING: 'embedContent',
  }
};

const getGeminiApiUrl = (endpoint = 'GENERATE_CONTENT', model = 'GEMINI_2_5_FLASH') => {
  const url = `${GEMINI_API.BASE_URL}/${GEMINI_API.MODEL[model]}:${GEMINI_API.ENDPOINTS[endpoint]}`;
  console.log(url)
  return `${GEMINI_API.BASE_URL}/${GEMINI_API.MODEL[model]}:${GEMINI_API.ENDPOINTS[endpoint]}`;
};

module.exports = {
  GEMINI_API,
  getGeminiApiUrl
};