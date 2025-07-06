'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { isDevelopment } from '../../../lib/constants';

// Mockユーザーの型定義
interface MockUser {
  id: string;
  roles: string[];
  generation: string;
  password: string;
}

// Mockユーザーの定義
const MOCK_USERS: MockUser[] = [
  { id: 'admin-user-1', roles: ['admin', 'member'], generation: '24', password: 'password' },
  { id: 'admin-user-2', roles: ['admin', 'member'], generation: '25', password: 'password' },
  { id: 'member-user-1', roles: ['member'], generation: '26', password: 'password' },
  { id: 'member-user-2', roles: ['member'], generation: '27', password: 'password' },
  { id: 'member-user-3', roles: ['member'], generation: '28', password: 'password' },
  { id: 'member-user-4', roles: ['member'], generation: '29', password: 'password' },
  { id: 'member-user-5', roles: ['member'], generation: '30', password: 'password' },
  { id: 'guest-user-1', roles: ['guest'], generation: '31', password: 'password' },
  { id: 'guest-user-2', roles: ['guest'], generation: '32', password: 'password' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 開発環境かどうかをチェック
  useEffect(() => {
    // 本番環境の場合はリダイレクト
    if (!isDevelopment) {
      // 本番環境ではOpenID Connectを使用
      // ここにOpenID Connectのリダイレクト処理を追加
      return;
    }

    // 既にログイン済みの場合はリダイレクト
    if (user && !loading) {
      router.push('/events');
    }
  }, [user, loading, router, isDevelopment]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const mockUser = MOCK_USERS.find(u => u.id === selectedUser);
      
      if (!mockUser) {
        setError('ユーザーが見つかりません');
        return;
      }

      if (mockUser.password !== password) {
        setError('パスワードが正しくありません');
        return;
      }

      // 認証コンテキストを使用してログイン
      const userData = {
        user_id: mockUser.id,
        roles: mockUser.roles,
        generation: parseInt(mockUser.generation, 10),
      };
      login(userData);

      // ログイン成功後、イベント一覧ページにリダイレクト
      router.push('/events');
    } catch (error) {
      setError('ログイン中にエラーが発生しました');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickLogin = (userId: string) => {
    setSelectedUser(userId);
    setPassword('password');
  };

  // 本番環境の場合はローディング表示
  if (!isDevelopment) {
    return (
      <div className="min-h-screen bg-kmc-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kmc-500 mx-auto"></div>
          <p className="mt-4 text-kmc-gray-600">認証中...</p>
        </div>
      </div>
    );
  }

  // ローディング中または既にログイン済みの場合はローディング表示
  if (loading || user) {
    return (
      <div className="min-h-screen bg-kmc-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kmc-500 mx-auto"></div>
          <p className="mt-4 text-kmc-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kmc-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-kmc-gray-900">
            開発環境ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-kmc-gray-600">
            開発環境用のmockユーザーでログインしてください
          </p>
        </div>

        <div className="card p-6">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="user" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                ユーザー選択
              </label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">ユーザーを選択してください</option>
                {MOCK_USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.id} ({user.roles.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="password"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-primary w-full flex justify-center py-2 px-4"
              >
                {isLoggingIn ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>

          {/* クイックログインボタン */}
          <div className="mt-6">
            <p className="text-sm text-kmc-gray-600 mb-3">クイックログイン:</p>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user.id)}
                  className="text-xs bg-kmc-gray-100 hover:bg-kmc-gray-200 text-kmc-gray-700 px-2 py-1 rounded border"
                >
                  {user.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 