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
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SCHEDULE_POLLING': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'FINISHED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">イベント一覧</h1>
            <Link
              href="/events/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              新規作成
            </Link>
          </div>
        </div>

        {/* フィルター */}
        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">ステータス:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* イベント一覧 */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">イベントが見つかりません</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {event.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>
                  
                  {event.venue && (
                    <p className="text-gray-600 text-sm mb-2">
                      📍 {event.venue}
                    </p>
                  )}
                  
                  <p className="text-gray-500 text-sm mb-4">
                    主催: {event.organizer_name}
                  </p>
                  
                  <p className="text-gray-400 text-xs">
                    作成日: {new Date(event.created_at).toLocaleDateString('ja-JP')}
                  </p>
                  
                  <div className="mt-4">
                    <Link
                      href={`/events/${event.event_id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      詳細を見る →
                    </Link>
                  </div>
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
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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