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
  name: string;
  roles: string[];
  generation: string;
  password: string;
}

// Mockユーザーデータ
const MOCK_USERS: MockUser[] = [
  { user_id: 'admin1', name: '田中 健太', roles: ['admin'], generation: '45', password: 'password' },
  { user_id: 'admin2', name: '佐藤 由美', roles: ['admin'], generation: '46', password: 'password' },
  { user_id: 'member1', name: '鈴木 太郎', roles: ['member'], generation: '45', password: 'password' },
  { user_id: 'member2', name: '高橋 花子', roles: ['member'], generation: '46', password: 'password' },
  { user_id: 'member3', name: '伊藤 次郎', roles: ['member'], generation: '47', password: 'password' },
  { user_id: 'member4', name: '渡辺 美咲', roles: ['member'], generation: '48', password: 'password' },
  { user_id: 'member5', name: '山田 健太', roles: ['member'], generation: '49', password: 'password' },
  { user_id: 'member6', name: '中村 愛子', roles: ['member'], generation: '50', password: 'password' },
  { user_id: 'member7', name: '小林 大輔', roles: ['member'], generation: '45', password: 'password' },
  { user_id: 'member8', name: '加藤 恵子', roles: ['member'], generation: '46', password: 'password' },
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
            setUser({
              user_id: mockUser.user_id,
              name: mockUser.name,
              roles: mockUser.roles,
              generation: parseInt(mockUser.generation, 10),
            });
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