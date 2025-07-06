'use client';

import { EventSummary, EventSummaryStatusEnum, User } from '../../../../generated';

interface EventListProps {
  events: EventSummary[];
  onEventClick: (eventId: string) => void;
  eventParticipations: {[key: string]: boolean};
  currentUser: User | null;
}

export default function EventList({ events, onEventClick, eventParticipations, currentUser }: EventListProps) {
  const getStatusColor = (status: EventSummaryStatusEnum) => {
    switch (status) {
      case 'SCHEDULE_POLLING':
        return 'bg-pink-100 text-pink-800';
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

  const getEventBackgroundColor = (event: EventSummary) => {
    // 過去のイベントかどうかをチェック
    const isPastEvent = event.confirmed_date && new Date(event.confirmed_date) < new Date();
    
    if (isPastEvent) {
      return 'bg-blue-50 border-blue-200'; // グレーよりのブルー（過去のイベント）
    }
    
    if (!currentUser) {
      return 'bg-gray-50 border-gray-200'; // グレー（参加できない）
    }
    
    // 参加可能かどうかをチェック
    const canParticipate = event.allowed_participation_roles && 
      event.allowed_participation_roles.some(role => 
        currentUser.roles && currentUser.roles.includes(role)
      );
    
    if (!canParticipate) {
      return 'bg-gray-50 border-gray-200'; // グレー（参加できない）
    }
    
    // 参加登録済みかどうかをチェック
    const isParticipant = eventParticipations[event.event_id];
    
    if (isParticipant) {
      return 'bg-pink-50 border-pink-200'; // ピンク（参加登録済み）
    } else {
      return 'bg-yellow-50 border-yellow-200'; // イエロー（参加可能だが参加していない）
    }
  };

  // 作成日時でソート（新しい順）
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event) => (
        <div
          key={event.event_id}
          onClick={() => onEventClick(event.event_id)}
          className={`rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer ${getEventBackgroundColor(event)}`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {event.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>主催者: {event.organizer_name}</span>
                {event.venue && (
                  <span>会場: {event.venue}</span>
                )}
              </div>
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-kmc-100 text-kmc-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
              {currentUser && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.confirmed_date && new Date(event.confirmed_date) < new Date()
                    ? 'bg-blue-100 text-blue-800'
                    : !event.allowed_participation_roles || !event.allowed_participation_roles.some(role => 
                        currentUser.roles && currentUser.roles.includes(role)
                      )
                    ? 'bg-gray-100 text-gray-800'
                    : eventParticipations[event.event_id]
                    ? 'bg-pink-100 text-pink-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {event.confirmed_date && new Date(event.confirmed_date) < new Date()
                    ? '過去のイベント'
                    : !event.allowed_participation_roles || !event.allowed_participation_roles.some(role => 
                        currentUser.roles && currentUser.roles.includes(role)
                      )
                    ? '参加不可'
                    : eventParticipations[event.event_id]
                    ? '参加済み'
                    : '参加可能'
                  }
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 space-y-1">
              <div>作成日: {formatDate(event.created_at)}</div>
              {event.confirmed_date && (
                <div className="text-green-600">
                  確定日程: {formatDate(event.confirmed_date)}
                </div>
              )}
              {event.schedule_deadline && !event.confirmed_date && (
                <div className="text-blue-600">
                  日程確定予定日: {formatDate(event.schedule_deadline)}
                </div>
              )}
            </div>
            <div className="text-kmc-600 hover:text-kmc-700 font-medium text-sm">
              詳細を見る →
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 