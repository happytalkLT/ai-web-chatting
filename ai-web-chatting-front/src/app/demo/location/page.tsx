'use client';

import LocationPermissionButton from '@/components/LocationPermissionButton';

export default function LocationDemo() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">브라우저 위치 정보 권한 테스트</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h2 className="font-semibold mb-2">위치 정보 권한 요청 프로세스:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>아래 버튼을 클릭하면 브라우저가 자동으로 권한 팝업을 표시합니다</li>
            <li>"허용" 클릭 시: 정확한 위치 정보를 받아옵니다</li>
            <li>"차단" 클릭 시: 위치 정보 접근이 거부됩니다</li>
          </ol>
        </div>
        
        <LocationPermissionButton />
        
        <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
          <p className="font-semibold mb-2">참고사항:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>HTTPS 환경에서만 작동합니다 (localhost는 예외)</li>
            <li>사용자가 한번 거부하면 브라우저 설정에서 수동으로 변경해야 합니다</li>
            <li>모바일 기기에서는 GPS를 사용하여 더 정확한 위치를 제공합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}