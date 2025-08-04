import React, { useState } from 'react';
import { getCurrentLocation } from '@/utils/geolocation';

export default function LocationPermissionButton() {
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const requestLocationPermission = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 이 함수를 호출하면 브라우저가 자동으로 권한 요청 팝업을 표시합니다
      const locationData = await getCurrentLocation();
      
      // 위치 정보 획득 성공
      const locationText = locationData.city 
        ? `${locationData.city}, ${locationData.country}` 
        : `위도: ${locationData.latitude.toFixed(4)}, 경도: ${locationData.longitude.toFixed(4)}`;
      
      setLocation(locationText);
      console.log('위치 정보:', locationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '위치 정보를 가져올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={requestLocationPermission}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? '위치 정보 요청 중...' : '위치 정보 허용하기'}
      </button>
      
      {location && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          현재 위치: {location}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
    </div>
  );
}