import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "イベント管理システム",
  description: "イベント管理システム",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
        lineHeight: 1.6,
        color: "#333",
        backgroundColor: "#fff"
      }}>
        <header style={{
          backgroundColor: "#0070f3",
          color: "white",
          padding: "1rem 0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>
              イベント管理システム
            </h1>
          </div>
        </header>
        
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
