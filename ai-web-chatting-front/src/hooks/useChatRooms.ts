'use client';

import { useState, useEffect } from 'react';
import { ChatRoom } from '@/types/chat';
import { getChatRooms, createChatRoom } from '@/services/chatApi';

export const useChatRooms = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const rooms = await getChatRooms();
      setChatRooms(rooms);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chat rooms');
      console.error('Error fetching chat rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const addChatRoom = async (roomData: { name: string; description?: string; type?: 'public' | 'private' | 'group' }) => {
    try {
      const newRoom = await createChatRoom(roomData);
      setChatRooms(prev => [newRoom, ...prev]);
      return newRoom;
    } catch (err: any) {
      setError(err.message || 'Failed to create chat room');
      throw err;
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  return {
    chatRooms,
    loading,
    error,
    refetch: fetchChatRooms,
    addChatRoom
  };
};