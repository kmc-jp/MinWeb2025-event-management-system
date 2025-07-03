'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, handleApiError } from '../../../lib/api';
import { HealthCheck } from '../../../generated';

export default function HealthCheckPage() {
  const [healthStatus, setHealthStatus] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.healthCheck();
      setHealthStatus(response.data);
      setLastChecked(new Date());
    } catch (err) {
      setError(handleApiError(err));
      setHealthStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const formatLastChecked = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>システム状態</h1>
      </div>

      {/* ヘルスチェックカード */}
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "0.5rem", 
        padding: "2rem",
        backgroundColor: "white",
        marginBottom: "2rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>API サーバー</h2>
          <button
            onClick={checkHealth}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: loading ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem"
            }}
          >
            {loading ? "チェック中..." : "再チェック"}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ marginBottom: "1rem" }}>システム状態を確認中...</div>
            <div style={{ 
              width: "20px", 
              height: "20px", 
              border: "2px solid #f3f3f3",
              borderTop: "2px solid #0070f3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto"
            }}></div>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: "1rem", 
            backgroundColor: "#fee", 
            border: "1px solid #fcc", 
            borderRadius: "0.5rem", 
            marginBottom: "1rem",
            color: "#c33"
          }}>
            <strong>エラー:</strong> {error}
          </div>
        )}

        {healthStatus && (
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              padding: "1rem", 
              backgroundColor: healthStatus.status === 'ok' ? "#f0f9ff" : "#fef2f2", 
              borderRadius: "0.5rem",
              border: `1px solid ${healthStatus.status === 'ok' ? "#bae6fd" : "#fecaca"}`
            }}>
              <span style={{ fontWeight: "bold" }}>ステータス:</span>
              <span style={{ 
                color: healthStatus.status === 'ok' ? "#0369a1" : "#dc2626",
                fontWeight: "bold"
              }}>
                {healthStatus.status === 'ok' ? '正常' : 'エラー'}
              </span>
            </div>
            
            {lastChecked && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
                <span style={{ fontWeight: "bold" }}>最終確認:</span>
                <span>{formatLastChecked(lastChecked)}</span>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !healthStatus && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            システム状態を取得できませんでした
          </div>
        )}
      </div>

      {/* システム情報 */}
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "0.5rem", 
        padding: "2rem",
        backgroundColor: "white",
        marginBottom: "2rem"
      }}>
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.5rem" }}>システム情報</h2>
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>フロントエンド:</span>
            <span>Next.js (React)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>バックエンド:</span>
            <span>Go (Gin)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>アーキテクチャ:</span>
            <span>DDD/CQRS</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>API仕様:</span>
            <span>OpenAPI 3.0</span>
          </div>
        </div>
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
          href="/users/me" 
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid #0070f3",
            color: "#0070f3",
            textDecoration: "none",
            borderRadius: "0.5rem",
            fontWeight: "bold"
          }}
        >
          マイページ
        </Link>
      </div>

      <div style={{ textAlign: "center" }}>
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 