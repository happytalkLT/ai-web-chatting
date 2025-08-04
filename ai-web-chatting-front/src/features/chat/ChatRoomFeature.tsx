'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessage, ChatRoom } from '@/types/chat';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { sendChatMessage, sendChatMessageWithTool, sendChatMessageWithRag, Message, getChatRooms, getChatRoomMessages, ChatRoomMessage } from '@/services/chatApi';
import { ErrorMessages, isErrorMessage } from '@/constants/errorMessages';

interface ChatRoomFeatureProps {
  roomId: string;
}

export default function ChatRoomFeature({ roomId }: ChatRoomFeatureProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [chatMode, setChatMode] = useState<'content' | 'tool' | 'rag'>('content');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  // 고유한 메시지 ID 생성 함수
  const generateMessageId = (): string => {
    const timestamp = Date.now();
    const counter = messageIdCounter;
    setMessageIdCounter(prev => prev + 1);
    return `msg_${timestamp}_${counter}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 채팅방 정보 및 메시지 로드
  useEffect(() => {
    const loadChatRoomAndMessages = async () => {
      try {
        setIsLoadingRoom(true);
        setError(null);
        
        // 채팅방 정보 로드
        const rooms = await getChatRooms();
        const currentRoom = rooms.find(room => room.id === roomId);
        
        if (!currentRoom) {
          setError('채팅방을 찾을 수 없습니다.');
          return;
        }
        
        setChatRoom(currentRoom);
        
        // 채팅방 메시지 로드
        const roomMessages = await getChatRoomMessages(roomId);
        
        // 서버 메시지를 ChatMessage 형식으로 변환
        const convertedMessages: ChatMessage[] = roomMessages.map((msg: ChatRoomMessage, index: number) => {
          // messageType이 'system' 또는 'model'이면 AI 메시지로 처리
          const isAiMessage = msg.messageType === 'system' || msg.messageType === 'model';
          
          return {
            id: `server_${msg.id}_${index}`, // 서버 메시지는 고유한 접두사 사용
            text: msg.content,
            sender: isAiMessage ? 'ai' : (msg.senderId === currentRoom.createdBy ? 'user' : 'ai'),
            timestamp: new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            isLoading: false
          };
        });
        
        setMessages(convertedMessages.reverse()); // 시간순 정렬
        
      } catch (err: any) {
        console.error('Error loading chat room and messages:', err);
        setError(err.message || '채팅방을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingRoom(false);
      }
    };

    if (roomId) {
      loadChatRoomAndMessages();
    }
  }, [roomId]);

  const sendMessageByMode = async (messages: Message[], mode: 'content' | 'tool' | 'rag', roomId?: string): Promise<string> => {
    const chatMethods = {
      content: sendChatMessage,
      tool: sendChatMessageWithTool,
      rag: sendChatMessageWithRag
    };

    const selectedMethod = chatMethods[mode];
    return await selectedMethod(messages, roomId);
  };

  const handleSendMessage = async (inputMessage: string) => {
    if (!chatRoom) return;

    setIsLoading(true);
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
    const timestamp = `${period} ${formattedHours}:${formattedMinutes}`;

    const newMessage: ChatMessage = {
      id: generateMessageId(),
      text: inputMessage,
      sender: 'user',
      timestamp
    };

    setMessages(prev => [...prev, newMessage]);

    const loadingMessageId = generateMessageId();
    const startTime = Date.now();
    const loadingMessage: ChatMessage = {
      id: loadingMessageId,
      text: '',
      sender: 'ai',
      timestamp: `${period} ${formattedHours}:${formattedMinutes === '59' ? '00' : (parseInt(formattedMinutes) + 1).toString().padStart(2, '0')}`,
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Convert chat history to API format (exclude loading messages, empty texts, and error messages)
      const apiMessages: Message[] = messages
        .filter(msg => 
          !msg.isLoading && 
          msg.text && 
          msg.text.trim() !== '' &&
          !isErrorMessage(msg.text)
        )
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          text: msg.text
        }));
      
      // Add current user message
      apiMessages.push({
        role: 'user',
        text: inputMessage
      });
      
      console.log('Sending messages to API:', apiMessages);
      // AI API 호출 시 roomId 전달 - 서버에서 자동으로 메시지 저장
      const aiResponseText = await sendMessageByMode(apiMessages, chatMode, chatRoom.id);
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const durationSeconds = Math.round(durationMs / 1000);
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      const durationString = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageId 
          ? { ...msg, text: aiResponseText, isLoading: false, duration: durationString }
          : msg
      ));
    } catch (error) {
      console.error('AI 응답 오류:', error);
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const durationSeconds = Math.round(durationMs / 1000);
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      const durationString = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;

      const errorMessage = ErrorMessages.ERR0000;

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageId 
          ? { ...msg, text: errorMessage, isLoading: false, duration: durationString }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  if (isLoadingRoom) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-[#0066FF] mb-4"></i>
            <p className="text-[#A0AEC0]">채팅방을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
            <p className="text-[#A0AEC0] mb-6">{error}</p>
            <button
              onClick={handleGoBack}
              className="px-6 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] transition-colors"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-search text-4xl text-[#718096] mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">채팅방을 찾을 수 없습니다</h2>
            <p className="text-[#A0AEC0] mb-6">요청하신 채팅방이 존재하지 않거나 접근 권한이 없습니다.</p>
            <button
              onClick={handleGoBack}
              className="px-6 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] transition-colors"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans">
      <ChatHeader 
        roomName={chatRoom.name}
        roomDescription={chatRoom.description}
        onGoBack={handleGoBack}
      />
      <MessageList messages={messages} />
      <MessageInput 
        onSendMessage={handleSendMessage} 
        onModeChange={setChatMode} 
        isLoading={isLoading} 
      />
    </div>
  );
}