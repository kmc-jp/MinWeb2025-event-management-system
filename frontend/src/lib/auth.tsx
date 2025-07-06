'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../generated/api';
import { isDevelopment } from './constants';

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
  roles: string[];
  generation: string;
  password: string;
}

// Mockユーザーデータ
const MOCK_USERS: MockUser[] = [
  { user_id: 'admin-user-1', roles: ['admin', 'member'], generation: '24', password: 'password' },
  { user_id: 'admin-user-2', roles: ['admin', 'member'], generation: '25', password: 'password' },
  { user_id: 'member-user-1', roles: ['member'], generation: '26', password: 'password' },
  { user_id: 'member-user-2', roles: ['member'], generation: '27', password: 'password' },
  { user_id: 'member-user-3', roles: ['member'], generation: '28', password: 'password' },
  { user_id: 'member-user-4', roles: ['member'], generation: '29', password: 'password' },
  { user_id: 'member-user-5', roles: ['member'], generation: '30', password: 'password' },
  { user_id: 'guest-user-1', roles: ['guest'], generation: '31', password: 'password' },
  { user_id: 'guest-user-2', roles: ['guest'], generation: '32', password: 'password' },
];

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーのコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期化時にユーザー情報を取得
    const initializeAuth = () => {
      if (isDevelopment) {
        // 開発環境ではlocalStorageからmockユーザー情報を取得
        const mockUserData = localStorage.getItem('mockUser');
        if (mockUserData) {
          try {
            const mockUser: MockUser = JSON.parse(mockUserData);
            const userData = {
              user_id: mockUser.user_id,
              roles: mockUser.roles,
              generation: parseInt(mockUser.generation, 10),
            };
            setUser(userData as User);
          } catch (error) {
            console.error('Mockユーザーデータの解析に失敗しました:', error);
            localStorage.removeItem('mockUser');
          }
        }
      } else {
        // 本番環境ではOpenID Connectを使用
        // ここにOpenID Connectのトークン検証処理を追加
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