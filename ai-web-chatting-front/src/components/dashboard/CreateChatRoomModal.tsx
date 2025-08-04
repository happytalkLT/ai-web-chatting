'use client';

import React, { useState } from 'react';

interface CreateChatRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; type?: 'public' | 'private' | 'group' }) => Promise<void>;
}

const CreateChatRoomModal: React.FC<CreateChatRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private' | 'group'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('채팅방 이름을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type
      });
      
      setFormData({ name: '', description: '', type: 'public' });
      onClose();
    } catch (err: any) {
      setError(err.message || '채팅방 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: '', description: '', type: 'public' });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A202C] rounded-xl p-6 w-full max-w-md mx-4 border border-[#2D3748]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#E2E8F0]">새 채팅방 만들기</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-[#718096] hover:text-[#E2E8F0] transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
              채팅방 이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-[#E2E8F0] placeholder-[#718096] focus:border-[#0066FF] focus:outline-none transition-colors"
              placeholder="채팅방 이름을 입력하세요"
              maxLength={255}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
              설명 (선택사항)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-[#E2E8F0] placeholder-[#718096] focus:border-[#0066FF] focus:outline-none transition-colors resize-none"
              placeholder="채팅방 설명을 입력하세요"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
              채팅방 유형
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'public' | 'private' | 'group' }))}
              className="w-full px-3 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-[#E2E8F0] focus:border-[#0066FF] focus:outline-none transition-colors"
              disabled={isLoading}
            >
              <option value="public">공개</option>
              <option value="private">비공개</option>
              <option value="group">그룹</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[#2D3748] text-[#E2E8F0] rounded-lg hover:bg-[#4A5568] transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  생성 중...
                </>
              ) : (
                '생성하기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatRoomModal;