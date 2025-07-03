"use client";
import { useState } from "react";
import Link from "next/link";
import { DefaultApi, CreateEventRequest, UserRole } from "../../../../generated/api";
import { Configuration } from "../../../../generated/configuration";

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // APIクライアントの初期化
  const apiClient = new DefaultApi(new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      // OpenAPI仕様に合わせたリクエストデータを作成
      const createEventRequest: CreateEventRequest = {
        title: title,
        description: description || undefined,
        venue: venue || undefined,
        allowed_roles: [UserRole.RegularMember], // デフォルトで一般メンバーを許可
        tags: [],
        fee_settings: [],
        poll_type: "date_select",
        poll_candidates: []
      };

      const response = await apiClient.createEvent(createEventRequest);
      
      setMessage(`イベント作成に成功しました。イベントID: ${response.data.event_id}`);
      setTitle("");
      setDescription("");
      setVenue("");
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else if (error.message) {
        setMessage(error.message);
      } else {
        setMessage("APIサーバーに接続できません。バックエンドが起動しているか確認してください。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link 
          href="/events" 
          style={{
            color: "#0070f3",
            textDecoration: "none",
            marginRight: "1rem"
          }}
        >
          ← イベント一覧
        </Link>
        <Link 
          href="/" 
          style={{
            color: "#0070f3",
            textDecoration: "none"
          }}
        >
          ← ダッシュボード
        </Link>
      </div>
      
      <h1>イベント作成</h1>
      
      <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            イベントタイトル *
          </label>
          <input 
            type="text"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required
            maxLength={200}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "0.25rem",
              fontSize: "1rem"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            説明
          </label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            rows={4}
            maxLength={1000}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "0.25rem",
              fontSize: "1rem",
              resize: "vertical"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            会場
          </label>
          <input 
            type="text"
            value={venue} 
            onChange={e => setVenue(e.target.value)} 
            maxLength={200}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "0.25rem",
              fontSize: "1rem"
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "作成中..." : "イベントを作成"}
        </button>
      </form>
      
      {message && (
        <div style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: message.includes("成功") ? "#d4edda" : "#f8d7da",
          color: message.includes("成功") ? "#155724" : "#721c24",
          borderRadius: "0.25rem",
          border: `1px solid ${message.includes("成功") ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          {message}
        </div>
      )}
    </div>
  );
} 