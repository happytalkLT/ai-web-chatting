export type AiType = 'assistant' | 'code' | 'travel' | 'health' | 'language' | 'finance' | 'cooking' | 'music';

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
  lastMessage?: string;
  time?: string;
  aiType?: AiType;
  unread?: boolean;
}

export interface Message {
  id: string;
  chatRoomId: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
  isLoading?: boolean;
  duration?: string;
}