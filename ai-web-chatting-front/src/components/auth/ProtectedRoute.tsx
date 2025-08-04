'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // 초기 로딩이 끝난 후 한 번만 체크
    if (!loading && !isChecked) {
      setIsChecked(true);
      
      if (!user) {
        setShowDialog(true);
      }
    }
  }, [loading, user, isChecked]);

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00CCFF] mx-auto"></div>
          <p className="mt-4 text-[#A0AEC0]">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 비인증 상태 - 다이얼로그 표시
  if (showDialog) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-[#1A202C] border border-[#2D3748] rounded-lg p-6 max-w-sm mx-4 shadow-xl">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white">비정상적인 접근입니다</h3>
          </div>
          <p className="text-[#A0AEC0] mb-6">
            로그인이 필요한 페이지입니다.
          </p>
          <button
            onClick={handleLoginClick}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#0066FF] to-[#00CCFF] text-white font-medium rounded-lg hover:from-[#0052CC] hover:to-[#00A3CC] transition-all shadow-[0_0_10px_rgba(0,102,255,0.3)] hover:shadow-[0_0_15px_rgba(0,102,255,0.5)]"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  // 인증된 상태 - 자식 컴포넌트 렌더링
  if (user) {
    return <>{children}</>;
  }

  // 예외 처리
  return null;
};

export default ProtectedRoute;