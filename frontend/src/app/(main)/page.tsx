import Link from "next/link";

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>イベント管理システム</h1>
      
      <div style={{ marginTop: "2rem" }}>
        <h2>機能一覧</h2>
        <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "0.5rem", 
            padding: "1.5rem",
            backgroundColor: "white"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>イベント管理</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link 
                href="/events" 
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#0070f3",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "bold"
                }}
              >
                イベント一覧
              </Link>
              <Link 
                href="/events/new" 
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "bold"
                }}
              >
                イベント作成
              </Link>
            </div>
          </div>

          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "0.5rem", 
            padding: "1.5rem",
            backgroundColor: "white"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>ユーザー管理</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link 
                href="/users/me" 
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#6f42c1",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "bold"
                }}
              >
                マイページ
              </Link>
            </div>
          </div>

          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "0.5rem", 
            padding: "1.5rem",
            backgroundColor: "white"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>システム</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link 
                href="/health" 
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#fd7e14",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "bold"
                }}
              >
                システム状態
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "3rem", padding: "2rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
        <h2 style={{ margin: "0 0 1rem 0" }}>システム概要</h2>
        <p style={{ margin: "0.5rem 0", color: "#666" }}>
          このシステムは、サークル内利用を想定したイベント管理システムです。
        </p>
        <p style={{ margin: "0.5rem 0", color: "#666" }}>
          DDD/CQRSアーキテクチャに基づいて設計されており、イベントの作成から参加登録まで、
          一連のワークフローを管理できます。
        </p>
      </div>
    </div>
  );
} 