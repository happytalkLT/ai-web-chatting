'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupForm from '@/components/auth/SignupForm';
import AuthBackground from '@/components/auth/AuthBackground';
import BrandHeader from '@/components/auth/BrandHeader';
import { authApi } from '@/services/authApi';
import { ErrorCodes, ErrorMessages } from '@/constants/errorMessages';

const SignupFeature: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleSignup = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // 비밀번호 확인 검증
      if (data.password !== data.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }

      // API 호출
      const response = await authApi.signup({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (response.success) {
        setSuccess(true);
        
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      
      // 에러 코드에 따른 메시지 표시
      if (error.errorCode && ErrorMessages[error.errorCode as ErrorCodes]) {
        setError(ErrorMessages[error.errorCode as ErrorCodes]);
      } else {
        setError(error.message || '회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans relative overflow-hidden">
      <AuthBackground />
      <BrandHeader />
      <SignupForm
        name={name}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onSignup={handleSignup}
        loading={loading}
        error={error}
        success={success}
      />
      <div className="relative z-10 mt-16 mb-8 text-center text-[#718096] text-sm">
        <p>© 2025 AI Chat. 모든 권리 보유.</p>
      </div>
    </div>
  );
};

export default SignupFeature;