'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const DashboardHeader: React.FC = () => {
  const router = useRouter();

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <header className="h-[60px] px-4 flex items-center justify-between bg-[#0A1929]/70 backdrop-blur-md border-b border-[#2D3748]/30 z-10">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] flex items-center justify-center shadow-[0_0_10px_rgba(0,102,255,0.5)] mr-2">
          <i className="fas fa-comment-dots text-white"></i>
        </div>
        <span className="font-medium text-lg">AI 채팅</span>
      </div>
      <div className="flex items-center space-x-3">
        <button 
          className="w-8 h-8 flex items-center justify-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap"
          aria-label="검색"
        >
          <i className="fas fa-search"></i>
        </button>
        <button 
          onClick={handleSettings}
          className="w-8 h-8 flex items-center justify-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap"
          aria-label="설정"
        >
          <i className="fas fa-cog"></i>
        </button>
        <div 
          onClick={handleProfile}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer"
        >
          <span className="text-xs font-medium">KD</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;