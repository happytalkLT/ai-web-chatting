'use client';

import React, { useState } from 'react';

interface SearchSectionProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export default function SearchSection({ onSearch, isSearching }: SearchSectionProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4 text-[#E2E8F0]">문서 검색</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
            검색어를 입력하세요
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
              className="w-full px-4 py-3 pr-12 bg-[#1A202C]/40 border border-[#2D3748]/50 rounded-lg text-white placeholder-[#4A5568] focus:outline-none focus:border-[#0066FF]/50 transition-colors disabled:opacity-50"
              placeholder="예: React Hooks 사용법"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#718096]">
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-[#0066FF] to-[#00CCFF] text-white font-medium rounded-lg shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              검색 중...
            </>
          ) : (
            <>
              <i className="fas fa-search mr-2"></i>
              벡터 검색 실행
            </>
          )}
        </button>
      </form>

      <div className="mt-4 p-4 bg-[#1A202C]/40 rounded-lg border border-[#2D3748]/30">
        <p className="text-sm text-[#A0AEC0]">
          <i className="fas fa-info-circle mr-2 text-[#0066FF]"></i>
          벡터 검색은 단순 키워드 매칭이 아닌 의미적 유사성을 기반으로 검색합니다.
        </p>
      </div>
    </div>
  );
}