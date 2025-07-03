"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient, handleApiError } from "../../../lib/api";
import { EventSummary, PaginatedEventList } from "../../../generated";

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.listEvents(
        page, 
        pageSize, 
        statusFilter as any || undefined
      );
      
      const data: PaginatedEventList = response.data;
      setEvents(data.data);
      setTotalCount(data.total_count);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'DRAFT': '下書き',
      'SCHEDULE_POLLING': '日程調整中',
      'CONFIRMED': '確定済み',
      'FINISHED': '終了',
      'CANCELLED': 'キャンセル'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SCHEDULE_POLLING': 'bg-blue-100 text-blue-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'FINISHED': 'bg-purple-100 text-purple-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && events.length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1rem" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>イベント一覧</h1>
        <Link 
          href="/events/new" 
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "0.5rem",
            fontWeight: "bold"
          }}
        >
          新規作成
        </Link>
      </div>

      {error && (
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#fee", 
          border: "1px solid #fcc", 
          borderRadius: "0.5rem", 
          marginBottom: "1rem",
          color: "#c33"
        }}>
          {error}
        </div>
      )}

      {/* フィルター */}
      <div style={{ marginBottom: "2rem" }}>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "0.5rem",
            border: "1px solid #ddd",
            borderRadius: "0.25rem",
            marginRight: "1rem"
          }}
        >
          <option value="">すべてのステータス</option>
          <option value="DRAFT">下書き</option>
          <option value="SCHEDULE_POLLING">日程調整中</option>
          <option value="CONFIRMED">確定済み</option>
          <option value="FINISHED">終了</option>
          <option value="CANCELLED">キャンセル</option>
        </select>
      </div>

      {/* イベント一覧 */}
      <div style={{ marginBottom: "2rem" }}>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            イベントが見つかりません
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {events.map((event) => (
              <div 
                key={event.event_id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "0.5rem",
                  padding: "1.5rem",
                  backgroundColor: "white"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
                      <Link 
                        href={`/events/${event.event_id}`}
                        style={{ color: "#0070f3", textDecoration: "none" }}
                      >
                        {event.title}
                      </Link>
                    </h3>
                    {event.venue && (
                      <p style={{ margin: "0.5rem 0", color: "#666" }}>
                        会場: {event.venue}
                      </p>
                    )}
                    <p style={{ margin: "0.5rem 0", color: "#666" }}>
                      主催者: {event.organizer_name}
                    </p>
                    <p style={{ margin: "0.5rem 0", color: "#666" }}>
                      作成日: {formatDate(event.created_at)}
                    </p>
                  </div>
                  <span 
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "1rem",
                      fontSize: "0.875rem",
                      fontWeight: "bold"
                    }}
                    className={getStatusColor(event.status)}
                  >
                    {getStatusLabel(event.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #ddd",
              borderRadius: "0.25rem",
              backgroundColor: page === 1 ? "#f5f5f5" : "white",
              cursor: page === 1 ? "not-allowed" : "pointer"
            }}
          >
            前へ
          </button>
          
          <span style={{ padding: "0.5rem 1rem" }}>
            {page} / {totalPages} ページ
          </span>
          
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #ddd",
              borderRadius: "0.25rem",
              backgroundColor: page === totalPages ? "#f5f5f5" : "white",
              cursor: page === totalPages ? "not-allowed" : "pointer"
            }}
          >
            次へ
          </button>
        </div>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
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