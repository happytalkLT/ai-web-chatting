import { GeminiApiResponse } from '@/types';
import { apiClient } from './apiClient';

export interface Message {
  role: string;
  text: string;
}

export interface ChatApiRequest {
  messages: Message[];
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'group';
  maxParticipants?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    username: string;
    email: string;
  };
  participants?: Array<{
    id: string;
    userId: string;
    role: 'admin' | 'moderator' | 'member';
    nickname?: string;
    joinedAt: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }>;
}

export interface CreateChatRoomRequest {
  name: string;
  description?: string;
  type?: 'public' | 'private' | 'group';
}

export async function sendChatMessage(messages: Message[], roomId?: string): Promise<string> {
  try {
    const data = await apiClient.request<GeminiApiResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, roomId }),
    });
    
    return data.candidates[0]?.content?.parts[0]?.text || 'No response';
  } catch (error: any) {
    if (error.statusCode === 401) {
      throw new Error('인증이 필요합니다.');
    }
    throw new Error(error.message || 'Chat request failed');
  }
}

export async function sendChatMessageWithTool(messages: Message[], roomId?: string): Promise<string> {
  try {
    const data = await apiClient.request<GeminiApiResponse>('/ai/chat/tool', {
      method: 'POST',
      body: JSON.stringify({ messages, roomId }),
    });
    
    return data.candidates[0]?.content?.parts[0]?.text || 'No response';
  } catch (error: any) {
    if (error.statusCode === 401) {
      throw new Error('인증이 필요합니다.');
    }
    throw new Error(error.message || 'Chat request failed');
  }
}

export async function sendChatMessageWithRag(messages: Message[], roomId?: string): Promise<string> {
  try {
    const data = await apiClient.request<GeminiApiResponse>('/ai/chat/rag', {
      method: 'POST',
      body: JSON.stringify({ messages, roomId }),
    });
    
    return data.candidates[0]?.content?.parts[0]?.text || 'No response';
  } catch (error: any) {
    if (error.statusCode === 401) {
      throw new Error('인증이 필요합니다.');
    }
    throw new Error(error.message || 'Chat request failed');
  }
}

export async function createChatRoom(roomData: CreateChatRoomRequest): Promise<ChatRoom> {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    console.log('Creating room with token:', accessToken.substring(0, 20) + '...');
    
    const response = await fetch('http://localhost:8033/room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Room creation error:', response.status, errorData);
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(errorData.error || 'Chat room creation failed');
    }

    const result = await response.json();
    return result.data?.room || result.room || result;
  } catch (error: any) {
    console.error('Create room error:', error);
    throw new Error(error.message || 'Chat room creation failed');
  }
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch('http://localhost:8033/room', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get rooms error:', response.status, errorData);
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(errorData.error || 'Failed to fetch chat rooms');
    }

    const result = await response.json();
    const rooms = result.data?.rooms || result.rooms || result;
    return Array.isArray(rooms) ? rooms : [rooms];
  } catch (error: any) {
    console.error('Get rooms error:', error);
    throw new Error(error.message || 'Failed to fetch chat rooms');
  }
}

export interface ChatRoomMessage {
  id: string;
  content: string;
  chatRoomId: string;
  senderId: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'model';
  sender: {
    id: string;
    name?: string;
    username?: string;
    email: string;
  };
  createdAt: string;
  isEdited: boolean;
  editedAt?: string;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name?: string;
      username?: string;
      email: string;
    };
  };
}

export async function getChatRoomMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatRoomMessage[]> {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`http://localhost:8033/room/${roomId}/messages?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get messages error:', response.status, errorData);
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      if (response.status === 404) {
        throw new Error('채팅방을 찾을 수 없습니다.');
      }
      throw new Error(errorData.error || 'Failed to fetch messages');
    }

    const result = await response.json();
    const messages = result.data?.messages || result.messages || [];
    return Array.isArray(messages) ? messages : [];
  } catch (error: any) {
    console.error('Get messages error:', error);
    throw new Error(error.message || 'Failed to fetch messages');
  }
}

