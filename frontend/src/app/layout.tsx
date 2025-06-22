import QueryProvider from "@/lib/query-provider";

export const metadata = {
  title: 'イベント管理システム',
  description: 'サークル内利用を想定したイベント管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
