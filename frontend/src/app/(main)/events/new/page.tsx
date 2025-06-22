"use client";
import { useState } from "react";
import Link from "next/link";

export default function CreateEventPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("http://localhost:8080/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      
      if (res.ok) {
        setMessage("イベント作成に成功しました");
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
      } else {
        const data = await res.json();
        setMessage(data.error || "エラーが発生しました");
      }
    } catch (error) {
      setMessage("APIサーバーに接続できません。バックエンドが起動しているか確認してください。");
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
            イベント名 *
          </label>
          <input 
            type="text"
            value={name} 
            onChange={e => setName(e.target.value)} 
            required
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
        
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            開始日 *
          </label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "0.25rem",
              fontSize: "1rem"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            終了日 *
          </label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            required
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