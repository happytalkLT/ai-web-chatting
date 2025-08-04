import React from 'react';

const BrandHeader: React.FC = () => {
  return (
    <div className="relative z-10 mb-12 mt-16 flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] flex items-center justify-center shadow-[0_0_30px_rgba(0,102,255,0.5)] mb-4">
        <i className="fas fa-robot text-white text-3xl"></i>
      </div>
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00CCFF] to-[#7B42FF]">AI Chat</h1>
      <p className="text-[#A0AEC0] mt-2 text-lg">미래형 AI 대화 플랫폼</p>
    </div>
  );
};

export default BrandHeader;