import '../globals.css';
import { ProtectedRoute } from '../../lib/auth';

export const metadata = {
  title: 'イベント管理システム',
  description: 'イベントの作成・管理・参加を簡単に行えるシステム',
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </ProtectedRoute>
  );
}

// クライアントコンポーネントを別ファイルに分離
import MainLayoutContent from './MainLayoutContent';
