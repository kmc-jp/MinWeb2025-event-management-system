import Link from "next/link";

export default function EventsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>イベント一覧</h1>
        <Link 
          href="/events/new" 
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "0.25rem",
            fontSize: "0.875rem"
          }}
        >
          新規作成
        </Link>
      </div>
      
      <div style={{ padding: "2rem", backgroundColor: "#f5f5f5", borderRadius: "0.5rem", textAlign: "center" }}>
        <p>現在、イベント一覧機能は実装中です。</p>
        <p>イベント作成機能は利用可能です。</p>
      </div>
      
      <div style={{ marginTop: "2rem" }}>
        <Link 
          href="/" 
          style={{
            color: "#0070f3",
            textDecoration: "none"
          }}
        >
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
} 