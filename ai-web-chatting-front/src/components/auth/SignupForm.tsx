'use client';

import React from 'react';
import NameInput from './NameInput';
import EmailInput from './EmailInput';
import PasswordInputWithStrength from './PasswordInputWithStrength';
import PasswordConfirmInput from './PasswordConfirmInput';
import SocialLogin from './SocialLogin';

interface SignupFormProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onSignup: (data: { name: string; email: string; password: string; confirmPassword: string }) => void;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({
  name,
  email,
  password,
  confirmPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSignup,
  loading = false,
  error = null,
  success = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup({ name, email, password, confirmPassword });
  };

  const isFormValid = name.trim() !== '' && 
                     email.trim() !== '' && 
                     password.trim() !== '' && 
                     confirmPassword.trim() !== '' &&
                     password === confirmPassword &&
                     !loading;

  return (
    <div className="relative z-10 w-full max-w-md px-6">
      <div className="bg-[#1A202C]/40 backdrop-blur-md rounded-2xl p-8 border border-[#2D3748]/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <h2 className="text-2xl font-medium mb-6 text-center">회원가입</h2>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* 성공 메시지 */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm text-center">
              회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <NameInput value={name} onChange={onNameChange} />
          <EmailInput value={email} onChange={onEmailChange} />
          <PasswordInputWithStrength 
            value={password} 
            onChange={onPasswordChange}
            showStrengthIndicator={true}
          />
          <PasswordConfirmInput 
            value={confirmPassword} 
            onChange={onConfirmPasswordChange}
            password={password}
          />

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full font-medium py-3 rounded-lg transition-all cursor-pointer !rounded-button whitespace-nowrap flex items-center justify-center ${
              isFormValid && !loading
                ? 'bg-gradient-to-r from-[#0066FF] to-[#00CCFF] hover:from-[#0052CC] hover:to-[#00A3CC] text-white shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:shadow-[0_0_20px_rgba(0,102,255,0.5)]'
                : 'bg-[#2D3748]/50 text-[#718096] cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                처리 중...
              </>
            ) : (
              '회원가입'
            )}
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
        <span className="text-[#A0AEC0]">이미 계정이 있으신가요?</span>
        <a href="/login" className="text-[#00CCFF] hover:text-white hover:underline transition-colors">로그인</a>
      </div>
    </div>
  );
};

export default SignupForm;