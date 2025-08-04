'use client';

import React from 'react';

interface SearchResult {
  content: string;
  title: string;
  score: number;
  metadata: {
    category: string;
    source: string;
    createdAt: string;
  };
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00CCFF]"></div>
        <p className="mt-4 text-[#A0AEC0]">검색 중...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <i className="fas fa-search text-4xl text-[#4A5568] mb-4"></i>
        <p className="text-[#718096]">검색 결과가 여기에 표시됩니다</p>
        <p className="text-sm text-[#4A5568] mt-1">문서를 등록하고 검색어를 입력해보세요</p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'from-[#0066FF] to-[#00CCFF]',
      technical: 'from-[#6E48AA] to-[#9D50BB]',
      business: 'from-[#11998e] to-[#38ef7d]',
      education: 'from-[#4776E6] to-[#8E54E9]',
      other: 'from-[#718096] to-[#A0AEC0]'
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: '일반',
      technical: '기술',
      business: '비즈니스',
      education: '교육',
      other: '기타'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#E2E8F0]">
        검색 결과 ({results.length}개)
      </h3>

      {results.map((result, index) => (
        <div
          key={index}
          className="p-4 bg-[#1A202C]/40 rounded-lg border border-[#2D3748]/30 hover:border-[#0066FF]/30 transition-all"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-white mb-1">
                {result.title}
              </h4>
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(result.metadata.category)} text-white text-xs`}>
                  {getCategoryLabel(result.metadata.category)}
                </span>
                <span className="text-[#718096]">
                  {new Date(result.metadata.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
            
            {/* Score */}
            <div className="text-right">
              <div className="text-2xl font-bold text-[#00CCFF]">
                {(result.score * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-[#718096]">유사도</div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-3">
            <p className="text-sm text-[#A0AEC0] line-clamp-3">
              {result.content}
            </p>
          </div>

          {/* Score Bar */}
          <div className="mt-3">
            <div className="w-full h-2 bg-[#2D3748]/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] transition-all duration-500"
                style={{ width: `${result.score * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}