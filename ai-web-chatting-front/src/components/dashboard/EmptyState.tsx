'use client';

import React from 'react';

interface EmptyStateProps {
  onNewChat: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onNewChat }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#0A1929] to-[#1A365D] flex items-center justify-center mb-4 border border-[#2D3748]/50">
        <i className="fas fa-robot text-[#718096] text-3xl"></i>
      </div>
      <h3 className="text-xl font-medium text-[#E2E8F0] mb-2">아직 대화가 없습니다</h3>
      <p className="text-[#718096] text-center max-w-md mb-6">
        새로운 AI 채팅을 시작하고 다양한 주제에 대해 대화해보세요.
      </p>
      <button 
        onClick={onNewChat}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00CCFF] text-white font-medium shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] transition-all cursor-pointer !rounded-button whitespace-nowrap"
      >
        <i className="fas fa-plus mr-2"></i>
        새 대화 시작하기
      </button>
    </div>
  );
};

export default EmptyState;