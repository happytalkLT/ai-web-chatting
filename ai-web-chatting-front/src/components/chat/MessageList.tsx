import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import LoadingMessage from './LoadingMessage';
import MarkdownMessage from './MarkdownMessage';

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#0A1929] to-[#1A365D] flex items-center justify-center mb-4 border border-[#2D3748]/50 mx-auto">
              <i className="fas fa-robot text-[#718096] text-3xl"></i>
            </div>
            <h3 className="text-xl font-medium text-[#E2E8F0] mb-2">대화를 시작해보세요</h3>
            <p className="text-[#718096] text-sm max-w-md">
              AI 어시스턴트가 여러분의 질문에 답변해드립니다.
            </p>
          </div>
        </div>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[80%] md:max-w-[60%]`}>
            {message.sender === 'ai' && (
              <div className="flex items-center mb-1 ml-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] flex items-center justify-center shadow-[0_0_6px_rgba(0,102,255,0.5)] mr-2">
                  <i className="fas fa-robot text-white text-xs"></i>
                </div>
                <span className="text-xs text-[#718096]">AI 어시스턴트</span>
              </div>
            )}

            <div
              className={`rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-[#2D3748] to-[#4A5568] rounded-tr-none'
                  : 'bg-gradient-to-r from-[#0D2340] to-[#1A365D] rounded-tl-none'
              }`}
            >
              {message.isLoading ? (
                <LoadingMessage />
              ) : message.sender === 'ai' ? (
                <MarkdownMessage content={message.text} />
              ) : (
                <p className="text-sm md:text-base">{message.text}</p>
              )}
            </div>

            <div className={`text-xs text-[#718096] mt-1 ${
              message.sender === 'user' ? 'text-right mr-1' : 'text-left ml-1'
            }`}>
              <div className="flex items-center justify-between">
                <span>{message.timestamp}</span>
                {message.sender === 'ai' && message.duration && (
                  <span className="text-[#4A5568] text-xs">{message.duration}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}