'use client';

import React from 'react';

interface NewChatButtonProps {
  onClick: () => void;
}

const NewChatButton: React.FC<NewChatButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6">
      <button 
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] flex items-center justify-center shadow-[0_0_15px_rgba(0,102,255,0.5)] text-white hover:shadow-[0_0_20px_rgba(0,102,255,0.7)] transition-all cursor-pointer !rounded-button whitespace-nowrap"
        aria-label="새 채팅 시작"
      >
        <i className="fas fa-plus text-lg"></i>
      </button>
    </div>
  );
};

export default NewChatButton;