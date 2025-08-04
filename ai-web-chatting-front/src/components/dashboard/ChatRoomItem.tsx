'use client';

import React from 'react';
import { ChatRoom, AiType } from '@/types/chat';

interface ChatRoomItemProps {
  chat: ChatRoom;
  isSelected: boolean;
  onSelect: () => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ chat, isSelected, onSelect }) => {
  const getAiIcon = (type?: AiType): string => {
    if (!type) return 'fa-comments';
    
    const iconMap: Record<AiType, string> = {
      assistant: 'fa-robot',
      code: 'fa-code',
      travel: 'fa-plane',
      health: 'fa-heartbeat',
      language: 'fa-language',
      finance: 'fa-chart-line',
      cooking: 'fa-utensils',
      music: 'fa-music'
    };
    return iconMap[type] || 'fa-robot';
  };

  const getAiGradient = (type?: AiType): string => {
    if (!type) return 'from-[#4A5568] to-[#2D3748]';
    
    const gradientMap: Record<AiType, string> = {
      assistant: 'from-[#0066FF] to-[#00CCFF]',
      code: 'from-[#6E48AA] to-[#9D50BB]',
      travel: 'from-[#11998e] to-[#38ef7d]',
      health: 'from-[#FF416C] to-[#FF4B2B]',
      language: 'from-[#4776E6] to-[#8E54E9]',
      finance: 'from-[#396afc] to-[#2948ff]',
      cooking: 'from-[#f857a6] to-[#ff5858]',
      music: 'from-[#1ed7b5] to-[#f0f]'
    };
    return gradientMap[type] || 'from-[#0066FF] to-[#00CCFF]';
  };

  const formatTime = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`bg-[#1A202C]/40 backdrop-blur-sm rounded-xl p-3 hover:bg-[#2D3748]/40 transition-colors cursor-pointer border ${
        isSelected ? 'border-[#0066FF]/50' : 'border-[#2D3748]/30'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getAiGradient(chat.aiType)} flex items-center justify-center shadow-[0_0_10px_rgba(0,102,255,0.3)] mr-3`}>
          <i className={`fas ${getAiIcon(chat.aiType)} text-white`}></i>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-medium text-[#E2E8F0] truncate">{chat.name}</h3>
            <span className="text-xs text-[#718096] whitespace-nowrap ml-2">
              {formatTime(chat.time || chat.updatedAt)}
            </span>
          </div>
          <p className="text-sm text-[#A0AEC0] truncate">
            {chat.lastMessage || chat.description || '새 채팅방'}
          </p>
        </div>

        {chat.unread && (
          <div className="w-2 h-2 rounded-full bg-[#0066FF] ml-2 shadow-[0_0_5px_rgba(0,102,255,0.7)]"></div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomItem;