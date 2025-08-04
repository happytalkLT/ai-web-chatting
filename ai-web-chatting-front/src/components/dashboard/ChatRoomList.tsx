'use client';

import React from 'react';
import ChatRoomItem from './ChatRoomItem';
import { ChatRoom } from '@/types/chat';

interface ChatRoomListProps {
  chatRooms: ChatRoom[];
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ 
  chatRooms, 
  selectedChat, 
  onSelectChat 
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-6 text-[#E2E8F0]">최근 대화</h2>
      
      <div className="space-y-3">
        {chatRooms.map((chat) => (
          <ChatRoomItem
            key={chat.id}
            chat={chat}
            isSelected={selectedChat === chat.id}
            onSelect={() => onSelectChat(chat.id)}
          />
        ))}
      </div>

      {/* 더 많은 채팅방이 있을 경우 */}
      <div className="mt-6 text-center">
        <button className="text-[#718096] hover:text-[#A0AEC0] text-sm transition-colors cursor-pointer !rounded-button whitespace-nowrap">
          더 보기 <i className="fas fa-chevron-down ml-1"></i>
        </button>
      </div>
    </>
  );
};

export default ChatRoomList;