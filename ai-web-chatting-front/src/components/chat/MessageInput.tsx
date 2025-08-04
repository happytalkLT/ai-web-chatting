import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onModeChange?: (mode: 'content' | 'tool' | 'rag') => void;
  isLoading?: boolean;
}

export default function MessageInput({ onSendMessage, onModeChange, isLoading = false }: MessageInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [mode, setMode] = useState<'content' | 'tool' | 'rag'>('content');

  const handleSendMessage = () => {
    if (inputMessage.trim() === '' || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as 'content' | 'tool' | 'rag';
    setMode(newMode);
    onModeChange?.(newMode);
  };

  return (
    <div className="p-4 bg-[#0A1929]/70 backdrop-blur-md border-t border-[#2D3748]/30">
      <div className="mb-2">
        <select
          value={mode}
          onChange={handleModeChange}
          disabled={isLoading}
          className="bg-[#1A202C]/50 border border-[#2D3748]/50 rounded-lg py-1 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="content">Content</option>
          <option value="tool">Tool</option>
          <option value="rag">RAG</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <button className="w-10 h-10 flex items-center justify-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap">
          <i className="fas fa-paperclip"></i>
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap">
          <i className="fas fa-smile"></i>
        </button>

        <div className="flex-1 relative">
          <textarea
            className="w-full bg-[#1A202C]/50 border border-[#2D3748]/50 rounded-2xl py-3 px-4 text-white placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 resize-none h-12 max-h-32 overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="메시지를 입력하세요..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            disabled={isLoading}
            rows={1}
          />
        </div>

        <button className="w-10 h-10 flex items-center justify-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap">
          <i className="fas fa-microphone"></i>
        </button>

        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            inputMessage.trim() && !isLoading
              ? 'bg-[#0066FF] text-white shadow-[0_0_10px_rgba(0,102,255,0.5)] cursor-pointer'
              : 'bg-[#2D3748] text-[#718096] cursor-not-allowed'
          } transition-all !rounded-button whitespace-nowrap disabled:opacity-50`}
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}