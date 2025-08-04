import { useState, useEffect } from 'react';

type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'checking';

export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('checking');

  useEffect(() => {
    // 권한 상태 확인
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state as PermissionStatus);
        
        // 권한 상태 변경 감지
        result.addEventListener('change', () => {
          setPermissionStatus(result.state as PermissionStatus);
        });
      } catch (error) {
        console.error('권한 확인 실패:', error);
        setPermissionStatus('prompt');
      }
    };

    checkPermission();
  }, []);

  const requestPermission = async () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionStatus('granted');
          resolve(position);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionStatus('denied');
          }
          reject(error);
        }
      );
    });
  };

  return {
    permissionStatus,
    requestPermission,
    isGranted: permissionStatus === 'granted',
    isDenied: permissionStatus === 'denied',
    isPending: permissionStatus === 'prompt'
  };
};