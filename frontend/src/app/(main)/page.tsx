import Link from "next/link";

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>イベント管理システム</h1>
      
      <div style={{ marginTop: "2rem" }}>
        <h2>機能一覧</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "1rem 0" }}>
            <Link 
              href="/events/new" 
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
              イベント作成
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
} 