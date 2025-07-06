'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient, handleApiError } from '../../../lib/api';
import { EventSummary, EventSummaryStatusEnum, User } from '../../../generated';
import Calendar from './components/Calendar';
import EventList from './components/EventList';
import TagFilter from './components/TagFilter';
import ParticipationFilter, { ParticipationFilterType } from './components/ParticipationFilter';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [participationFilter, setParticipationFilter] = useState<ParticipationFilterType>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const pageSize = 50; // カレンダー表示のためにより多くのイベントを取得

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, selectedTags, participationFilter]);

  const fetchCurrentUser = async () => {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.getCurrentUser();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiClient = getApiClient();
      const tagsParam = selectedTags.length > 0 ? selectedTags.join(',') : undefined;
      const response = await apiClient.listEvents(currentPage, pageSize, undefined, tagsParam);
      let eventData = response.data.data.map((event: any) => ({
        ...event,
        schedule_deadline: event.schedule_deadline ?? undefined,
      })) as EventSummary[];

      // 参加状況フィルターをフロントエンドで適用
      if (participationFilter !== 'all' && currentUser) {
        eventData = eventData.filter((event: EventSummary) => {
          if (participationFilter === 'joinable') {
            // 参加可能な役割を持っているかチェック（参加済みも含む）
            const userRoles = currentUser.roles || [];
            const allowedRoles = event.allowed_participation_roles || [];
            const isJoinable = userRoles.some((userRole: string) => allowedRoles.includes(userRole));
            
            // 参加済みかチェック（Mock実装では一部のイベントに参加済みとする）
            const joinedEventIds = ['mock-event-1', 'mock-event-2', 'mock-event-4']; // Mock: 複数のイベントに参加済み
            const isJoined = joinedEventIds.includes(event.event_id);
            
            // 参加可能または参加済みの場合に表示
            return isJoinable || isJoined;
          } else if (participationFilter === 'joined') {
            // 参加済みかチェック（Mock実装では一部のイベントに参加済みとする）
            const joinedEventIds = ['mock-event-1', 'mock-event-2', 'mock-event-4']; // Mock: 複数のイベントに参加済み
            return joinedEventIds.includes(event.event_id);
          }
          return true;
        });
      }

      setEvents(eventData);
      setTotalCount(eventData.length); // フィルター適用後の件数
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

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    setCurrentPage(1); // タグが変更されたら最初のページに戻る
  };

  const handleParticipationFilterChange = (filter: ParticipationFilterType) => {
    setParticipationFilter(filter);
    setCurrentPage(1); // フィルターが変更されたら最初のページに戻る
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

        {/* フィルターと表示モード */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <TagFilter selectedTags={selectedTags} onTagsChange={handleTagsChange} />
            <ParticipationFilter 
              selectedFilter={participationFilter} 
              onFilterChange={handleParticipationFilterChange} 
            />
            {selectedTags.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">選択中:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-kmc-100 text-kmc-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagsChange(selectedTags.filter(t => t !== tag))}
                        className="ml-1 text-kmc-600 hover:text-kmc-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 表示モード切り替え */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">表示:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                カレンダー
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                リスト
              </button>
            </div>
          </div>
        </div>

        {/* イベント表示 */}
        {viewMode === 'calendar' ? (
          <Calendar events={events} onEventClick={handleEventClick} />
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-kmc-gray-500 text-lg">イベントがありません</p>
            <p className="text-kmc-gray-400 mt-2">
              {selectedTags.length > 0 
                ? '選択されたタグに一致するイベントがありません' 
                : '新しいイベントを作成してみましょう'
              }
            </p>
          </div>
        ) : (
          <EventList events={events} onEventClick={handleEventClick} />
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