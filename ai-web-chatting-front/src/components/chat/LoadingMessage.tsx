import React from 'react';

export default function LoadingMessage() {
  return (
    <div className="flex space-x-1">
      <div className="w-3 h-3 bg-[#718096] rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-[#718096] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-3 h-3 bg-[#718096] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
}