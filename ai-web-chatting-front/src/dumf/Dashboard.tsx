// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState } from 'react';

const App: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  // 채팅방 데이터
  const chatRooms = [
    {
      id: 1,
      name: '일상 대화 도우미',
      lastMessage: '네, 오늘 하루도 화이팅하세요!',
      time: '오후 2:30',
      aiType: 'assistant',
      unread: false
    },
    {
      id: 2,
      name: '코딩 헬퍼',
      lastMessage: 'React Hooks에 대해 더 알려드릴까요?',
      time: '오전 11:45',
      aiType: 'code',
      unread: true
    },
    {
      id: 3,
      name: '여행 계획 어시스턴트',
      lastMessage: '제주도 3박 4일 일정 추천해 드렸습니다.',
      time: '어제',
      aiType: 'travel',
      unread: false
    },
    {
      id: 4,
      name: '건강 관리 코치',
      lastMessage: '오늘의 운동 루틴을 완료하셨나요?',
      time: '어제',
      aiType: 'health',
      unread: false
    },
    {
      id: 5,
      name: '영어 학습 튜터',
      lastMessage: '다음 회화 연습은 내일 예정되어 있습니다.',
      time: '7월 2일',
      aiType: 'language',
      unread: false
    },
    {
      id: 6,
      name: '금융 어드바이저',
      lastMessage: '주식 시장 분석 결과를 보내드렸습니다.',
      time: '7월 1일',
      aiType: 'finance',
      unread: false
    },
    {
      id: 7,
      name: '요리 레시피 봇',
      lastMessage: '오늘의 저녁 메뉴 추천: 김치찌개',
      time: '6월 30일',
      aiType: 'cooking',
      unread: false
    },
    {
      id: 8,
      name: '음악 추천 AI',
      lastMessage: '취향에 맞는 플레이리스트를 생성했습니다.',
      time: '6월 28일',
      aiType: 'music',
      unread: false
    }
  ];

  const getAiIcon = (type: string) => {
    switch (type) {
      case 'assistant':
        return 'fa-robot';
      case 'code':
        return 'fa-code';
      case 'travel':
        return 'fa-plane';
      case 'health':
        return 'fa-heartbeat';
      case 'language':
        return 'fa-language';
      case 'finance':
        return 'fa-chart-line';
      case 'cooking':
        return 'fa-utensils';
      case 'music':
        return 'fa-music';
      default:
        return 'fa-robot';
    }
  };

  const getAiGradient = (type: string) => {
    switch (type) {
      case 'assistant':
        return 'from-[#0066FF] to-[#00CCFF]';
      case 'code':
        return 'from-[#6E48AA] to-[#9D50BB]';
      case 'travel':
        return 'from-[#11998e] to-[#38ef7d]';
      case 'health':
        return 'from-[#FF416C] to-[#FF4B2B]';
      case 'language':
        return 'from-[#4776E6] to-[#8E54E9]';
      case 'finance':
        return 'from-[#396afc] to-[#2948ff]';
      case 'cooking':
        return 'from-[#f857a6] to-[#ff5858]';
      case 'music':
        return 'from-[#1ed7b5] to-[#f0f]';
      default:
        return 'from-[#0066FF] to-[#00CCFF]';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans">
      {/* 상단 네비게이션 헤더 */}
      <header className="h-[60px] px-4 flex items-center justify-between bg-[#0A1929]/70 backdrop-blur-md border-b border-[#2D3748]/30 z-10">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] flex items-center justify-center shadow-[0_0_10px_rgba(0,102,255,0.5)] mr-2">
            <i className="fas fa-comment-dots text-white"></i>
          </div>
          <span className="font-medium text-lg">AI 채팅</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="w-8 h-8 flex items-center justify-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap">
            <i className="fas fa-search"></i>
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap">
            <i className="fas fa-cog"></i>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer">
            <span className="text-xs font-medium">KD</span>
          </div>
        </div>
      </header>

      {/* 채팅방 리스트 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-[#E2E8F0]">최근 대화</h2>

          <div className="space-y-3">
            {chatRooms.map((chat) => (
              <div
                key={chat.id}
                className="bg-[#1A202C]/40 backdrop-blur-sm rounded-xl p-3 hover:bg-[#2D3748]/40 transition-colors cursor-pointer border border-[#2D3748]/30"
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getAiGradient(chat.aiType)} flex items-center justify-center shadow-[0_0_10px_rgba(0,102,255,0.3)] mr-3`}>
                    <i className={`fas ${getAiIcon(chat.aiType)} text-white`}></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-[#E2E8F0] truncate">{chat.name}</h3>
                      <span className="text-xs text-[#718096] whitespace-nowrap ml-2">{chat.time}</span>
                    </div>
                    <p className="text-sm text-[#A0AEC0] truncate">{chat.lastMessage}</p>
                  </div>

                  {chat.unread && (
                    <div className="w-2 h-2 rounded-full bg-[#0066FF] ml-2 shadow-[0_0_5px_rgba(0,102,255,0.7)]"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 더 많은 채팅방이 있을 경우 */}
          <div className="mt-6 text-center">
            <button className="text-[#718096] hover:text-[#A0AEC0] text-sm transition-colors cursor-pointer !rounded-button whitespace-nowrap">
              더 보기 <i className="fas fa-chevron-down ml-1"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 새 채팅 시작 버튼 */}
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] flex items-center justify-center shadow-[0_0_15px_rgba(0,102,255,0.5)] text-white hover:shadow-[0_0_20px_rgba(0,102,255,0.7)] transition-all cursor-pointer !rounded-button whitespace-nowrap">
          <i className="fas fa-plus text-lg"></i>
        </button>
      </div>

      {/* 빈 채팅방 상태 (선택적) */}
      {chatRooms.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#0A1929] to-[#1A365D] flex items-center justify-center mb-4 border border-[#2D3748]/50">
            <i className="fas fa-robot text-[#718096] text-3xl"></i>
          </div>
          <h3 className="text-xl font-medium text-[#E2E8F0] mb-2">아직 대화가 없습니다</h3>
          <p className="text-[#718096] text-center max-w-md mb-6">
            새로운 AI 채팅을 시작하고 다양한 주제에 대해 대화해보세요.
          </p>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00CCFF] text-white font-medium shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] transition-all cursor-pointer !rounded-button whitespace-nowrap">
            <i className="fas fa-plus mr-2"></i>
            새 대화 시작하기
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
