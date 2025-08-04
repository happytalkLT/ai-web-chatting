'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import AuthBackground from '@/components/auth/AuthBackground';
import BrandHeader from '@/components/auth/BrandHeader';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/constants/errorMessages';

const LoginFeature: React.FC = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await signIn(email, password);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // 로그인 성공 시 대시보드로 이동
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#0A1929] to-[#0D2340] text-white font-sans relative overflow-hidden">
      <AuthBackground />
      <BrandHeader />
      <LoginForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
        loading={loading}
        error={error}
      />
      <div className="relative z-10 mt-16 mb-8 text-center text-[#718096] text-sm">
        <p>© 2025 AI Chat. 모든 권리 보유.</p>
      </div>
    </div>
  );
};

export default LoginFeature;