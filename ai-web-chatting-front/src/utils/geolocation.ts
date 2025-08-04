export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
}

export const getCurrentLocation = (): Promise<LocationInfo> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Reverse geocoding API를 사용하여 도시 정보 얻기 (옵션)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          resolve({
            latitude,
            longitude,
            accuracy,
            city: data.address?.city || data.address?.town,
            country: data.address?.country
          });
        } catch (error) {
          console.error(error)
          // 위치 정보만 반환
          resolve({ latitude, longitude, accuracy });
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('사용자가 위치 정보 제공을 거부했습니다'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('위치 정보를 사용할 수 없습니다'));
            break;
          case error.TIMEOUT:
            reject(new Error('위치 정보 요청 시간이 초과되었습니다'));
            break;
          default:
            reject(new Error('알 수 없는 오류가 발생했습니다'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};
