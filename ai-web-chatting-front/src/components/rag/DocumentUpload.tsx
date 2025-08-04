'use client';

import React, { useState, useRef } from 'react';

interface DocumentUploadProps {
  onUpload: (content: string, title: string, category: string, file?: File) => void;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadMessage: string;
}

export default function DocumentUpload({ onUpload, uploadStatus, uploadMessage }: DocumentUploadProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('텍스트 파일(.txt)만 업로드 가능합니다.');
      return;
    }

    try {
      const text = await file.text();
      setContent(text);
      setSelectedFile(file);
      setTitle(file.name.replace('.txt', ''));
    } catch (error) {
      console.error('File read error:', error);
      alert('파일을 읽는 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 파일 업로드 방식인 경우 파일 객체도 함께 전달
    if (inputMethod === 'file' && selectedFile) {
      onUpload(content, title, category, selectedFile);
    } else {
      onUpload(content, title, category);
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-[#E2E8F0]">문서 등록</h2>

      {/* Input Method Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setInputMethod('text');
            setSelectedFile(null);
          }}
          className={`px-4 py-2 rounded-lg transition-all ${
            inputMethod === 'text'
              ? 'bg-gradient-to-r from-[#0066FF] to-[#00CCFF] text-white'
              : 'bg-[#1A202C]/40 text-[#A0AEC0] hover:bg-[#2D3748]/40'
          }`}
        >
          <i className="fas fa-keyboard mr-2"></i>
          텍스트 입력
        </button>
        <button
          onClick={() => setInputMethod('file')}
          className={`px-4 py-2 rounded-lg transition-all ${
            inputMethod === 'file'
              ? 'bg-gradient-to-r from-[#0066FF] to-[#00CCFF] text-white'
              : 'bg-[#1A202C]/40 text-[#A0AEC0] hover:bg-[#2D3748]/40'
          }`}
        >
          <i className="fas fa-file-upload mr-2"></i>
          파일 업로드
        </button>
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#A0AEC0] mb-2">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-[#1A202C]/40 border border-[#2D3748]/50 rounded-lg text-white placeholder-[#4A5568] focus:outline-none focus:border-[#0066FF]/50 transition-colors"
          placeholder="문서 제목을 입력하세요"
        />
      </div>

      {/* Category Select */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#A0AEC0] mb-2">카테고리</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 bg-[#1A202C]/40 border border-[#2D3748]/50 rounded-lg text-white focus:outline-none focus:border-[#0066FF]/50 transition-colors"
        >
          <option value="general">일반</option>
          <option value="technical">기술</option>
          <option value="business">비즈니스</option>
          <option value="education">교육</option>
          <option value="other">기타</option>
        </select>
      </div>

      {/* Content Input */}
      <div className="flex-1 mb-4">
        <label className="block text-sm font-medium text-[#A0AEC0] mb-2">내용</label>
        
        {inputMethod === 'file' ? (
          <div className="h-full flex flex-col">
            <div 
              className="mb-3 p-6 border-2 border-dashed border-[#2D3748]/50 rounded-lg text-center hover:border-[#0066FF]/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fas fa-cloud-upload-alt text-3xl text-[#718096] mb-2"></i>
              <p className="text-[#A0AEC0]">클릭하여 파일 선택</p>
              <p className="text-sm text-[#4A5568] mt-1">텍스트 파일(.txt)만 지원</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            {content && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full px-4 py-3 bg-[#1A202C]/40 border border-[#2D3748]/50 rounded-lg text-white placeholder-[#4A5568] focus:outline-none focus:border-[#0066FF]/50 transition-colors resize-none"
                placeholder="파일 내용이 여기에 표시됩니다"
              />
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full w-full px-4 py-3 bg-[#1A202C]/40 border border-[#2D3748]/50 rounded-lg text-white placeholder-[#4A5568] focus:outline-none focus:border-[#0066FF]/50 transition-colors resize-none"
            placeholder="문서 내용을 입력하세요..."
          />
        )}
      </div>

      {/* Upload Status */}
      {uploadMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          uploadStatus === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : uploadStatus === 'error'
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : ''
        }`}>
          {uploadMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={uploadStatus === 'uploading'}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0066FF] to-[#00CCFF] text-white font-medium rounded-lg shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadStatus === 'uploading' ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              업로드 중...
            </>
          ) : (
            <>
              <i className="fas fa-upload mr-2"></i>
              문서 저장
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-[#1A202C]/40 text-[#A0AEC0] font-medium rounded-lg border border-[#2D3748]/50 hover:bg-[#2D3748]/40 transition-all"
        >
          초기화
        </button>
      </div>
    </div>
  );
}