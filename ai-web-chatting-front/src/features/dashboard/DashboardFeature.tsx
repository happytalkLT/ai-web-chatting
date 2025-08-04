'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ChatRoomList from '@/components/dashboard/ChatRoomList';
import EmptyState from '@/components/dashboard/EmptyState';
import NewChatButton from '@/components/dashboard/NewChatButton';
import CreateChatRoomModal from '@/components/dashboard/CreateChatRoomModal';
import { useChatRooms } from '@/hooks/useChatRooms';

const DashboardFeature: React.FC = () => {
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { chatRooms, loading, error, addChatRoom } = useChatRooms();

  const handleNewChat = () => {
    setIsModalOpen(true);
  };

  const handleCreateRoom = async (data: { name: string; description?: string; type?: 'public' | 'private' | 'group' }) => {
    await addChatRoom(data);
  };

  const handleSelectChat = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-[#0066FF] mb-4"></i>
            <p className="text-[#A0AEC0]">채팅방을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans">
      <DashboardHeader />
      
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}
          
          {chatRooms.length > 0 ? (
            <ChatRoomList 
              chatRooms={chatRooms} 
              selectedChat={selectedChat}
              onSelectChat={handleSelectChat}
            />
          ) : (
            <EmptyState onNewChat={handleNewChat} />
          )}
        </div>
      </div>

      <NewChatButton onClick={handleNewChat} />
      
      <CreateChatRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRoom}
      />
    </div>
  );
};

export default DashboardFeature;