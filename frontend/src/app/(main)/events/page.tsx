"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DefaultApi, EventSummary } from "../../../generated/api";
import { Configuration } from "../../../generated/configuration";

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // APIクライアントの初期化
  const apiClient = new DefaultApi(new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  }));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await apiClient.listEvents();
        setEvents(response.data.data);
        setError(null);
      } catch (error: any) {
        console.error('API Error:', error);
        setError("イベント一覧の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'DRAFT': '下書き',
      'SCHEDULE_POLLING': '日程調整中',
      'CONFIRMED': '確定',
      'FINISHED': '終了',
      'CANCELLED': 'キャンセル'
    };
    return statusMap[status] || status;
  };

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
      
      {loading && (
        <div style={{ padding: "2rem", backgroundColor: "#f5f5f5", borderRadius: "0.5rem", textAlign: "center" }}>
          <p>イベント一覧を読み込み中...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: "2rem", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "0.5rem", textAlign: "center" }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div style={{ padding: "2rem", backgroundColor: "#f5f5f5", borderRadius: "0.5rem", textAlign: "center" }}>
          <p>イベントがありません。</p>
          <p>新しいイベントを作成してください。</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {events.map((event) => (
            <div 
              key={event.event_id}
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
                backgroundColor: "white"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{event.title}</h3>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#e9ecef",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  color: "#495057"
                }}>
                  {getStatusLabel(event.status)}
                </span>
              </div>
              
              {event.venue && (
                <p style={{ margin: "0.5rem 0", color: "#666", fontSize: "0.9rem" }}>
                  📍 {event.venue}
                </p>
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#666" }}>
                  主催者: {event.organizer_name}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#666" }}>
                  作成日: {formatDate(event.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
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