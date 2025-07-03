'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, handleApiError } from '../../../lib/api';
import { EventSummary, PaginatedEventList } from '../../../generated';

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.listEvents(
        currentPage,
        pageSize,
        statusFilter as any || undefined,
        undefined
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
  }, [currentPage, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-kmc-gray-100 text-kmc-gray-800';
      case 'SCHEDULE_POLLING': return 'bg-kmc-100 text-kmc-700';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'FINISHED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-kmc-gray-100 text-kmc-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return '下書き';
      case 'SCHEDULE_POLLING': return '日程調整中';
      case 'CONFIRMED': return '確定';
      case 'FINISHED': return '終了';
      case 'CANCELLED': return 'キャンセル';
      default: return status;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-kmc-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kmc-500 mx-auto"></div>
            <p className="mt-4 text-kmc-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kmc-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-kmc-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-kmc-gray-900">イベント一覧</h1>
              <p className="mt-1 text-kmc-gray-600">作成されたイベントの一覧を表示します</p>
            </div>
            <Link
              href="/events/new"
              className="btn-primary"
            >
              新規作成
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フィルター */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-kmc-gray-200 p-6">
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium text-kmc-gray-700">ステータス:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">すべて</option>
                <option value="DRAFT">下書き</option>
                <option value="SCHEDULE_POLLING">日程調整中</option>
                <option value="CONFIRMED">確定</option>
                <option value="FINISHED">終了</option>
                <option value="CANCELLED">キャンセル</option>
              </select>
            </div>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* イベント一覧 */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-kmc-gray-200 p-8">
              <p className="text-kmc-gray-500 text-lg">イベントが見つかりません</p>
              <p className="text-kmc-gray-400 text-sm mt-2">新しいイベントを作成してみてください</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-kmc-gray-900 line-clamp-2 flex-1 mr-3">
                    {event.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                </div>
                
                {event.venue && (
                  <p className="text-kmc-gray-600 text-sm mb-2 flex items-center">
                    <span className="mr-1">📍</span>
                    {event.venue}
                  </p>
                )}
                
                <p className="text-kmc-gray-500 text-sm mb-4">
                  主催: {event.organizer_name}
                </p>
                
                <p className="text-kmc-gray-400 text-xs mb-4">
                  作成日: {new Date(event.created_at).toLocaleDateString('ja-JP')}
                </p>
                
                <div className="pt-4 border-t border-kmc-gray-100">
                  <Link
                    href={`/events/${event.event_id}`}
                    className="text-kmc-500 hover:text-kmc-600 text-sm font-medium flex items-center"
                  >
                    詳細を見る
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              
              <span className="px-3 py-2 text-sm text-kmc-gray-700 bg-white border border-kmc-gray-300 rounded-md">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 