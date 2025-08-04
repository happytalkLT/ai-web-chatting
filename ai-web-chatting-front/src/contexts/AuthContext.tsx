'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, type User } from '@/services/authApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = authApi.getAccessToken();
      if (!token) {
        setUser(null);
        return false;
      }

      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      }
      
      setUser(null);
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        // 토큰이 있다면 저장 (서버에서 토큰을 반환하는 경우)
        // localStorage.setItem('auth_token', response.token);
        return { error: null };
      } else {
        return { error: response.message || 'Login failed' };
      }
    } catch (error: any) {
      return { error: error.message || 'An unknown error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await authApi.signup({ email, password, name });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: response.message || 'Signup failed' };
      }
    } catch (error: any) {
      return { error: error.message || 'An unknown error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await authApi.resetPassword(email);
      return { error: response.success ? null : response.message };
    } catch (error: any) {
      return { error: error.message || 'An unknown error occurred' };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};