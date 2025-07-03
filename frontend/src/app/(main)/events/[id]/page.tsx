'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient, handleApiError } from '../../../../lib/api';
import { EventDetails } from '../../../../generated';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getEventDetails(eventId);
        setEvent(response.data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          読み込み中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
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
        <div style={{ textAlign: "center" }}>
          <Link 
            href="/events" 
            style={{
              color: "#0070f3",
              textDecoration: "none"
            }}
          >
            ← イベント一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          イベントが見つかりません
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>{event.title}</h1>
          <span 
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "1rem",
              fontSize: "0.875rem",
              fontWeight: "bold"
            }}
            className={getStatusColor(event.status)}
          >
            {getStatusLabel(event.status)}
          </span>
        </div>
        
        <div style={{ color: "#666", marginBottom: "1rem" }}>
          <p style={{ margin: "0.5rem 0" }}>
            主催者: {event.organizer_name}
          </p>
          <p style={{ margin: "0.5rem 0" }}>
            作成日: {formatDate(event.created_at)}
          </p>
          {event.updated_at && (
            <p style={{ margin: "0.5rem 0" }}>
              更新日: {formatDate(event.updated_at)}
            </p>
          )}
        </div>
      </div>

      {/* イベント詳細 */}
      <div style={{ marginBottom: "2rem" }}>
        {event.description && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>説明</h2>
            <div style={{ 
              padding: "1rem", 
              backgroundColor: "#f8f9fa", 
              borderRadius: "0.5rem",
              whiteSpace: "pre-wrap"
            }}>
              {event.description}
            </div>
          </div>
        )}

        {event.venue && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>会場</h2>
            <p style={{ fontSize: "1.1rem" }}>{event.venue}</p>
          </div>
        )}

        {event.allowed_roles && event.allowed_roles.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>参加可能な役割</h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {event.allowed_roles.map((role, index) => (
                <span 
                  key={index}
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    borderRadius: "1rem",
                    fontSize: "0.875rem"
                  }}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {event.tags && event.tags.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>タグ</h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {event.tags.map((tag, index) => (
                <span 
                  key={index}
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#f3e5f5",
                    color: "#7b1fa2",
                    borderRadius: "1rem",
                    fontSize: "0.875rem"
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {event.fee_settings && event.fee_settings.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>料金設定</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              {event.fee_settings.map((feeSetting, index) => (
                <div 
                  key={index}
                  style={{
                    padding: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: "0.5rem",
                    backgroundColor: "white"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: "0 0 0.25rem 0", fontWeight: "bold" }}>
                        {feeSetting.applicable_role}
                      </p>
                      {feeSetting.applicable_generation && (
                        <p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>
                          世代: {feeSetting.applicable_generation}
                        </p>
                      )}
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#0070f3" }}>
                      {formatMoney(feeSetting.fee.amount, feeSetting.fee.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        justifyContent: "center",
        marginBottom: "2rem"
      }}>
        <Link 
          href="/events" 
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid #0070f3",
            color: "#0070f3",
            textDecoration: "none",
            borderRadius: "0.5rem",
            fontWeight: "bold"
          }}
        >
          イベント一覧に戻る
        </Link>
        
        {event.status === 'DRAFT' && (
          <Link 
            href={`/events/${event.event_id}/edit`}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#0070f3",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.5rem",
              fontWeight: "bold"
            }}
          >
            編集
          </Link>
        )}
      </div>
    </div>
  );
} 