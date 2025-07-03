'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient, handleApiError } from '../../../lib/api';
import { EventSummary, EventSummaryStatusEnum } from '../../../generated';
import Calendar from './components/Calendar';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50; // カレンダー表示のためにより多くのイベントを取得

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

  // カレンダーコンポーネントで使用するため、これらの関数は削除

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

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

        {/* カレンダー表示 */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-kmc-gray-500 text-lg">イベントがありません</p>
            <p className="text-kmc-gray-400 mt-2">新しいイベントを作成してみましょう</p>
          </div>
        ) : (
          <Calendar events={events} onEventClick={handleEventClick} />
        )}

        {/* ページネーション（カレンダー表示では非表示） */}
        {/* 
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
        */}
      </div>
    </div>
  );
} 