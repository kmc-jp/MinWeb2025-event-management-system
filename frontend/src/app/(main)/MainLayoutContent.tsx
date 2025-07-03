'use client';

import { useAuth } from '../../lib/auth';
import Link from 'next/link';

export default function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const roleLabels: { [key: string]: string } = {
    CircleAdmin: '運営',
    RegularMember: '一般部員',
    Alumni: 'OB・OG',
    External: '外部の方',
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-kmc-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-kmc-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/events" className="text-xl font-bold text-kmc-500">
                イベント管理システム
              </Link>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-kmc-gray-600">
                  <span className="font-medium">{user.name}</span>
                  <span className="mx-2">•</span>
                  <span>{roleLabels[user.role]}</span>
                  {user.generation && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{user.generation}期</span>
                    </>
                  )}
                  {isDevelopment && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-orange-600 font-medium">開発環境</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-kmc-gray-600 hover:text-kmc-gray-800 text-sm font-medium"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        {children}
      </main>
    </div>
  );
} 