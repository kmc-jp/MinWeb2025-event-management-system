'use client';

import { EventSummary, EventSummaryStatusEnum } from '../../../../generated';

interface EventListProps {
  events: EventSummary[];
  onEventClick: (eventId: string) => void;
}

export default function EventList({ events, onEventClick }: EventListProps) {
  const getStatusColor = (status: EventSummaryStatusEnum) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
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
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
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
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </span>
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