'use client';

import React, { useState } from 'react';
import DocumentUpload from '@/components/rag/DocumentUpload';
import SearchSection from '@/components/rag/SearchSection';
import SearchResults from '@/components/rag/SearchResults';
import { ragApi } from '@/services/ragApi';

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

export default function RagDemoFeature() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleDocumentUpload = async (content: string, title: string, category: string, file?: File) => {
    setUploadStatus('uploading');
    setUploadMessage('');

    try {
      let response;
      
      // 파일이 제공된 경우 파일 업로드 API 사용
      if (file) {
        response = await ragApi.storeKnowledgeFile(file, {
          title,
          category: category || 'general',
          source: 'file_upload',
          knowledgeType: 'text'
        });
      } else {
        // 텍스트 직접 입력의 경우 기존 API 사용
        response = await ragApi.storeKnowledge({
          content,
          title,
          category: category || 'general',
          source: 'user_upload',
          knowledgeType: 'text'
        });
      }
      
      if (response.success) {
        setUploadStatus('success');
        
        // 파일 업로드의 경우 추가 정보 표시
        if (file && response.data && 'chunkCount' in response.data) {
          setUploadMessage(`파일이 성공적으로 업로드되었습니다. (${response.data.chunkCount}개 청크로 분할됨)`);
        } else {
          setUploadMessage(response.message || '문서가 성공적으로 저장되었습니다.');
        }
        
        // Reset after 3 seconds
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
        }, 3000);
      } else {
        throw new Error(response.message || '문서 저장에 실패했습니다.');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(error instanceof Error ? error.message : '문서 저장 중 오류가 발생했습니다.');
      console.error('Document upload error:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await ragApi.searchKnowledge({
        query,
        limit: 5
      });
      
      if (response.success && response.data?.results) {
        const formattedResults: SearchResult[] = response.data.results.map(result => ({
          content: result.content,
          title: result.title || '무제',
          score: result.score,
          metadata: {
            category: result.metadata?.category || 'general',
            source: result.metadata?.source || 'unknown',
            createdAt: result.metadata?.createdAt || new Date().toISOString()
          }
        }));
        
        setSearchResults(formattedResults);
      } else {
        console.error('Search failed:', response.message);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Optionally show error message to user
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans">
      {/* Header */}
      <div className="bg-[#0A1929]/70 backdrop-blur-md border-b border-[#2D3748]/30 px-6 py-4">
        <h1 className="text-2xl font-bold">RAG (Retrieval-Augmented Generation) 데모</h1>
        <p className="text-[#A0AEC0] text-sm mt-1">문서를 벡터로 저장하고 의미 기반 검색을 테스트해보세요</p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-88px)]">
        {/* Left Panel - Document Upload */}
        <div className="w-full lg:w-1/2 p-6 border-r border-[#2D3748]/30">
          <DocumentUpload 
            onUpload={handleDocumentUpload}
            uploadStatus={uploadStatus}
            uploadMessage={uploadMessage}
          />
        </div>

        {/* Right Panel - Search */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col">
          <SearchSection 
            onSearch={handleSearch}
            isSearching={isSearching}
          />
          
          <div className="mt-6 flex-1 overflow-y-auto">
            <SearchResults 
              results={searchResults}
              isLoading={isSearching}
            />
          </div>
        </div>
      </div>
    </div>
  );
}