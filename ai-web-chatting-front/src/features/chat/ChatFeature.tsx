'use client';

import React, { useState } from 'react';
import { ChatMessage } from '@/types/chat';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { sendChatMessage, sendChatMessageWithTool, sendChatMessageWithRag, Message } from '@/services/chatApi';
import { ErrorMessages, isErrorMessage } from '@/constants/errorMessages';

export default function ChatFeature() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMode, setChatMode] = useState<'content' | 'tool' | 'rag'>('content');
  const [isLoading, setIsLoading] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  // 고유한 메시지 ID 생성 함수
  const generateMessageId = (): string => {
    const timestamp = Date.now();
    const counter = messageIdCounter;
    setMessageIdCounter(prev => prev + 1);
    return `demo_${timestamp}_${counter}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendMessageByMode = async (messages: Message[], mode: 'content' | 'tool' | 'rag'): Promise<string> => {
    const chatMethods = {
      content: sendChatMessage,
      tool: sendChatMessageWithTool,
      rag: sendChatMessageWithRag
    };

    const selectedMethod = chatMethods[mode];
    return await selectedMethod(messages);
  };

  const handleSendMessage = async (inputMessage: string) => {
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
      const aiResponseText = await sendMessageByMode(apiMessages, chatMode);
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

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageId 
          ? { ...msg, text: ErrorMessages.ERR0000, isLoading: false, duration: durationString }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans">
      <ChatHeader />
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} onModeChange={setChatMode} isLoading={isLoading} />
    </div>
  );
}