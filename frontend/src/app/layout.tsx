import './globals.css';
import { AuthProvider } from '../lib/auth';

export const metadata = {
  title: 'イベント管理システム',
  description: 'イベントの作成・管理・参加を簡単に行えるシステム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 