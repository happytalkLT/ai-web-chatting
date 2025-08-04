'use client';

import React, { useState } from 'react';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';
import SocialLogin from './SocialLogin';

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onLogin: (email: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onLogin,
  loading = false,
  error = null,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="relative z-10 w-full max-w-md px-6">
      <div className="bg-[#1A202C]/40 backdrop-blur-md rounded-2xl p-8 border border-[#2D3748]/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <h2 className="text-2xl font-medium mb-6 text-center">로그인</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <EmailInput value={email} onChange={onEmailChange} />
          <PasswordInput value={password} onChange={onPasswordChange} />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white font-medium py-3 rounded-lg shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] transition-all cursor-pointer !rounded-button whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-[#4A5568]/50"></div>
            <div className="px-3 text-sm text-[#A0AEC0]">또는</div>
            <div className="flex-grow h-px bg-[#4A5568]/50"></div>
          </div>

          <SocialLogin />
        </form>
      </div>

      <div className="mt-6 flex justify-center space-x-6 text-sm">
        <a href="#" className="text-[#A0AEC0] hover:text-white hover:underline transition-colors">비밀번호 찾기</a>
        <span className="text-[#4A5568]">|</span>
        <a href="/signup" className="text-[#00CCFF] hover:text-white hover:underline transition-colors">회원가입</a>
      </div>
    </div>
  );
};

export default LoginForm;