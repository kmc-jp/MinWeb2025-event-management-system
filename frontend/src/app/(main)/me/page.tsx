'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, handleApiError } from '../../../lib/api';
import { User } from '../../../generated';

export default function CurrentUserPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getCurrentUser();
        setUser(response.data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'CircleAdmin': 'サークル管理者',
      'RegularMember': '正規メンバー',
      'Alumni': '卒業生',
      'External': '外部参加者'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'CircleAdmin': 'bg-red-100 text-red-800',
      'RegularMember': 'bg-blue-100 text-blue-800',
      'Alumni': 'bg-green-100 text-green-800',
      'External': 'bg-gray-100 text-gray-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
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

  if (!user) {
    return (
      <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          ユーザー情報が見つかりません
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>マイページ</h1>
      </div>

      {/* ユーザー情報カード */}
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "0.5rem", 
        padding: "2rem",
        backgroundColor: "white",
        marginBottom: "2rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "#0070f3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
            fontWeight: "bold",
            marginRight: "2rem"
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>{user.name}</h2>
            <span 
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "1rem",
                fontSize: "0.875rem",
                fontWeight: "bold"
              }}
              className={getRoleColor(user.role)}
            >
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>ユーザーID:</span>
            <span style={{ fontFamily: "monospace" }}>{user.user_id}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>名前:</span>
            <span>{user.name}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>役割:</span>
            <span>{getRoleLabel(user.role)}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>世代:</span>
            <span>{user.generation}</span>
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
          イベント一覧を見る
        </Link>
        
        <Link 
          href="/events/new" 
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid #0070f3",
            color: "#0070f3",
            textDecoration: "none",
            borderRadius: "0.5rem",
            fontWeight: "bold"
          }}
        >
          イベントを作成
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
    </div>
  );
} 