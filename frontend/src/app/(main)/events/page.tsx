'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiClient, handleApiError } from '../../../lib/api';
import { EventSummary, EventSummaryStatusEnum } from '../../../generated';

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const apiClient = getApiClient();
      const response = await apiClient.listEvents(currentPage, pageSize);
      setEvents(response.data.data);
      setTotalCount(response.data.total_count);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: EventSummaryStatusEnum) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SCHEDULE_POLLING':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'FINISHED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: EventSummaryStatusEnum) => {
    switch (status) {
      case 'DRAFT':
        return '下書き';
      case 'SCHEDULE_POLLING':
        return '日程調整中';
      case 'CONFIRMED':
        return '確定';
      case 'FINISHED':
        return '終了';
      case 'CANCELLED':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* イベント一覧 */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-kmc-gray-500 text-lg">イベントがありません</p>
            <p className="text-kmc-gray-400 mt-2">新しいイベントを作成してみましょう</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.event_id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-kmc-gray-900 line-clamp-2">
                    {event.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-kmc-gray-600">
                  <p>主催者: {event.organizer_name}</p>
                  <p>作成日: {formatDate(event.created_at)}</p>
                </div>
                
                <div className="mt-4">
                  <Link
                    href={`/events/${event.event_id}`}
                    className="text-kmc-500 hover:text-kmc-600 font-medium text-sm"
                  >
                    詳細を見る →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-kmc-gray-500 bg-white border border-kmc-gray-300 rounded-md hover:bg-kmc-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              
              <span className="px-3 py-2 text-sm text-kmc-gray-700">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-kmc-gray-500 bg-white border border-kmc-gray-300 rounded-md hover:bg-kmc-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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