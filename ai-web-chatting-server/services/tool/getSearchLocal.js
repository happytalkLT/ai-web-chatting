const url = 'https://openapi.naver.com/v1/search/local.json';

const gerSearchLocal = async ({query}) => {

  console.log(query)

  const clientId = process.env.NAVER_APPLICATION_CLIENT_ID;
  const clientSecret = process.env.NAVER_APPLICATION_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Naver API credentials not found in environment variables');
  }

  try {
    const searchParams = new URLSearchParams({
      query: query,
      display: 5,
      start: 1,
      sort: 'random'
    });

    const response = await fetch(`${url}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error searching local:', error);
    throw error;
  }
}

module.exports = gerSearchLocal;