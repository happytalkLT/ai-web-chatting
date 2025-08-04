import React from 'react';

interface ChatHeaderProps {
  roomName?: string;
  roomDescription?: string;
  onGoBack?: () => void;
}

export default function ChatHeader({ 
  roomName = 'AI 어시스턴트', 
  roomDescription,
  onGoBack 
}: ChatHeaderProps) {
  return (
    <header className="h-[60px] px-4 flex items-center justify-between bg-[#0A1929]/70 backdrop-blur-md border-b border-[#2D3748]/30">
      <button 
        onClick={onGoBack}
        className="w-8 h-8 flex items-center justify-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap"
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      <div className="flex items-center max-w-[60%]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] flex items-center justify-center shadow-[0_0_10px_rgba(0,102,255,0.5)] mr-2 flex-shrink-0">
          <i className="fas fa-comments text-white"></i>
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">{roomName}</div>
          {roomDescription && (
            <div className="text-xs text-[#718096] truncate">{roomDescription}</div>
          )}
        </div>
      </div>

      <button className="w-8 h-8 flex items-center justify-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap">
        <i className="fas fa-ellipsis-v"></i>
      </button>
    </header>
  );
}