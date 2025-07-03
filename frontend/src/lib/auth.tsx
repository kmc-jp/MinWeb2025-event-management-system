'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../generated';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Mockユーザーの型定義
interface MockUser {
  user_id: string;
  name: string;
  role: UserRole;
  generation: string;
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーのコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 開発環境かどうかをチェック
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // 初期化時にユーザー情報を取得
    const initializeAuth = () => {
      if (isDevelopment) {
        // 開発環境ではlocalStorageからmockユーザー情報を取得
        const mockUserData = localStorage.getItem('mockUser');
        if (mockUserData) {
          try {
            const mockUser: MockUser = JSON.parse(mockUserData);
            setUser({
              user_id: mockUser.user_id,
              name: mockUser.name,
              role: mockUser.role,
              generation: mockUser.generation,
            });
          } catch (error) {
            console.error('Mockユーザーデータの解析に失敗しました:', error);
            localStorage.removeItem('mockUser');
          }
        }
      } else {
        // 本番環境ではOpenID Connectを使用
        // ここにOpenID Connectのトークン検証処理を追加
        console.log('本番環境ではOpenID Connectを使用します');
      }
      setLoading(false);
    };

    initializeAuth();
  }, [isDevelopment]);

  const login = (userData: User) => {
    if (isDevelopment) {
      // 開発環境ではlocalStorageに保存
      localStorage.setItem('mockUser', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = () => {
    if (isDevelopment) {
      // 開発環境ではlocalStorageから削除
      localStorage.removeItem('mockUser');
    } else {
      // 本番環境ではOpenID Connectのログアウト処理
      // ここにOpenID Connectのログアウト処理を追加
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 認証フック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 認証が必要なページを保護するためのコンポーネント
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (loading) {
    return (
      <div className="min-h-screen bg-kmc-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kmc-500 mx-auto"></div>
          <p className="mt-4 text-kmc-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // 未認証の場合はログインページにリダイレクト
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return <>{children}</>;
} 