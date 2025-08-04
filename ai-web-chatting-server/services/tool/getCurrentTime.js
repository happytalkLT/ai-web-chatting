const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
require('dayjs/locale/ko');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko');

// 도시/국가 이름을 시간대로 매핑
const locationToTimezone = {
  // 한국
  '서울': 'Asia/Seoul',
  '한국': 'Asia/Seoul',
  '대한민국': 'Asia/Seoul',
  
  // 일본
  '도쿄': 'Asia/Tokyo',
  '일본': 'Asia/Tokyo',
  '오사카': 'Asia/Tokyo',
  
  // 중국
  '베이징': 'Asia/Shanghai',
  '상하이': 'Asia/Shanghai',
  '중국': 'Asia/Shanghai',
  
  // 유럽
  '파리': 'Europe/Paris',
  '프랑스': 'Europe/Paris',
  '베를린': 'Europe/Berlin',
  '뮌헨': 'Europe/Berlin',
  '독일': 'Europe/Berlin',
  '런던': 'Europe/London',
  '영국': 'Europe/London',
  '로마': 'Europe/Rome',
  '이탈리아': 'Europe/Rome',
  '마드리드': 'Europe/Madrid',
  '스페인': 'Europe/Madrid',
  '암스테르담': 'Europe/Amsterdam',
  '네덜란드': 'Europe/Amsterdam',
  
  // 미국
  '뉴욕': 'America/New_York',
  '워싱턴': 'America/New_York',
  '로스앤젤레스': 'America/Los_Angeles',
  'LA': 'America/Los_Angeles',
  '시카고': 'America/Chicago',
  '덴버': 'America/Denver',
  
  // 기타
  '시드니': 'Australia/Sydney',
  '호주': 'Australia/Sydney',
  '뉴질랜드': 'Pacific/Auckland',
  '오클랜드': 'Pacific/Auckland',
  '두바이': 'Asia/Dubai',
  'UAE': 'Asia/Dubai',
  '싱가포르': 'Asia/Singapore',
  '방콕': 'Asia/Bangkok',
  '태국': 'Asia/Bangkok',
  '인도': 'Asia/Kolkata',
  '뉴델리': 'Asia/Kolkata',
  '모스크바': 'Europe/Moscow',
  '러시아': 'Europe/Moscow'
};

const getCurrentTime = (params) => {
  const { location } = params;
  
  // location을 timezone으로 변환
  let timezone = location;
  
  // 도시/국가 이름인 경우 매핑된 시간대 찾기
  const normalizedLocation = location.toLowerCase().replace(/\s/g, '');
  for (const [key, value] of Object.entries(locationToTimezone)) {
    if (normalizedLocation === key.toLowerCase()) {
      timezone = value;
      break;
    }
  }
  
  // 시간대 형식이 아닌 경우 (예: "Europe/Paris" 형식이 아닌 경우)
  if (!timezone.includes('/')) {
    // 매핑에서 찾지 못한 경우
    return {
      success: false,
      error: `Unknown location: ${location}`,
      message: `Location "${location}" could not be mapped to a timezone. Please use a major city name or standard timezone format.`
    };
  }
  
  try {
    const now = dayjs().tz(timezone);
    const year = now.year();
    const month = now.month() + 1;
    const date = now.date();
    const hour = now.hour();
    const minute = now.minute();
    const second = now.second();
    const period = hour < 12 ? '오전' : '오후';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    // 원래 입력이 도시/국가 이름이었다면 추가 정보 제공
    const displayLocation = location !== timezone ? ` - ${location}` : '';
    const formattedTime = `${year}년 ${month}월 ${date}일 ${period} ${displayHour}시 ${minute.toString().padStart(2, '0')}분 ${second.toString().padStart(2, '0')}초 (${timezone})${displayLocation}`;
    
    return {
      success: true,
      time: formattedTime,
      timezone: timezone,
      location: location
    };
  } catch (error) {
    return {
      success: false,
      error: `Invalid timezone: ${timezone}`,
      message: error.message
    };
  }
}

module.exports = getCurrentTime;