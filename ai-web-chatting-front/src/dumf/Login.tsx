// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState } from 'react';

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 흐르는 그라데이션 라인 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-0 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-[#00CCFF] to-transparent transform -rotate-12 translate-y-[20vh]"></div>
          <div className="absolute top-0 left-0 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-[#0066FF] to-transparent transform -rotate-12 translate-y-[40vh]"></div>
          <div className="absolute top-0 left-0 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-[#7B42FF] to-transparent transform -rotate-12 translate-y-[60vh]"></div>
        </div>

        {/* 미세 입자 효과 */}
        <div className="absolute inset-0 bg-[url('https://readdy.ai/api/search-image?query=abstract%20digital%20particles%20floating%20in%20dark%20space%2C%20tiny%20dots%20of%20light%2C%20futuristic%20tech%20background%2C%20minimal%2C%20elegant%2C%20dark%20navy%20blue%20and%20black%2C%20subtle%20glow%20effects%2C%20depth%20of%20field&width=1440&height=900&seq=particles001&orientation=landscape')] bg-cover opacity-20"></div>

        {/* 흐릿한 채팅 인터페이스 실루엣 */}
        <div className="absolute bottom-0 right-0 w-[40%] h-[50%] opacity-10">
          <div className="absolute bottom-10 right-10 w-full h-full bg-[url('https://readdy.ai/api/search-image?query=abstract%20silhouette%20of%20a%20chat%20interface%2C%20message%20bubbles%2C%20minimalist%20design%2C%20futuristic%20UI%20elements%2C%20glowing%20edges%2C%20dark%20background%20with%20blue%20accent%2C%20tech%20aesthetic%2C%20blurred%20outlines&width=600&height=600&seq=chatsilhouette001&orientation=squarish')] bg-contain bg-no-repeat bg-right-bottom"></div>
        </div>
      </div>

      {/* 브랜드 영역 */}
      <div className="relative z-10 mb-12 mt-16 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] flex items-center justify-center shadow-[0_0_30px_rgba(0,102,255,0.5)] mb-4">
          <i className="fas fa-robot text-white text-3xl"></i>
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00CCFF] to-[#7B42FF]">AI Chat</h1>
        <p className="text-[#A0AEC0] mt-2 text-lg">미래형 AI 대화 플랫폼</p>
      </div>

      {/* 로그인 박스 */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-[#1A202C]/40 backdrop-blur-md rounded-2xl p-8 border border-[#2D3748]/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h2 className="text-2xl font-medium mb-6 text-center">로그인</h2>

          <div className="space-y-5">
            {/* 이메일 입력 필드 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#718096]">
                <i className="fas fa-envelope"></i>
              </div>
              <input
                type="email"
                className="w-full bg-[#2D3748]/30 border border-[#4A5568]/50 rounded-lg py-3 pl-10 pr-3 text-white placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* 비밀번호 입력 필드 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#718096]">
                <i className="fas fa-lock"></i>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-[#2D3748]/30 border border-[#4A5568]/50 rounded-lg py-3 pl-10 pr-10 text-white placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            {/* 로그인 버튼 */}
            <button className="w-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white font-medium py-3 rounded-lg shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] transition-all cursor-pointer !rounded-button whitespace-nowrap">
              로그인
            </button>

            {/* 구분선 */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-[#4A5568]/50"></div>
              <div className="px-3 text-sm text-[#A0AEC0]">또는</div>
              <div className="flex-grow h-px bg-[#4A5568]/50"></div>
            </div>

            {/* 소셜 로그인 버튼 */}
            <div className="grid grid-cols-3 gap-3">
              <button className="flex justify-center items-center bg-[#2D3748]/50 hover:bg-[#2D3748]/80 text-white p-3 rounded-lg transition-all cursor-pointer !rounded-button whitespace-nowrap">
                <i className="fab fa-google"></i>
              </button>
              <button className="flex justify-center items-center bg-[#2D3748]/50 hover:bg-[#2D3748]/80 text-white p-3 rounded-lg transition-all cursor-pointer !rounded-button whitespace-nowrap">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button className="flex justify-center items-center bg-[#2D3748]/50 hover:bg-[#2D3748]/80 text-white p-3 rounded-lg transition-all cursor-pointer !rounded-button whitespace-nowrap">
                <i className="fab fa-apple"></i>
              </button>
            </div>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="mt-6 flex justify-center space-x-6 text-sm">
          <a href="#" className="text-[#A0AEC0] hover:text-white hover:underline transition-colors">비밀번호 찾기</a>
          <span className="text-[#4A5568]">|</span>
          <a href="#" className="text-[#A0AEC0] hover:text-white hover:underline transition-colors">회원가입</a>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="relative z-10 mt-16 mb-8 text-center text-[#718096] text-sm">
        <p>© 2025 AI Chat. 모든 권리 보유.</p>
      </div>
    </div>
  );
};

export default App;
