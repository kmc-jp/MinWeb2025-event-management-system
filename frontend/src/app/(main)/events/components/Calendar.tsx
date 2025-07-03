'use client';

import { useState, useEffect } from 'react';
import { EventSummary } from '../../../../generated';

interface CalendarProps {
  events: EventSummary[];
  onEventClick: (eventId: string) => void;
}

// 週カレンダーを削除し、月カレンダーのみに変更

export default function Calendar({ events, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // 週カレンダー機能を削除

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      // 日程確定済みの場合は確定した日程で表示
      if ((event as any).confirmed_date) {
        const eventDate = new Date((event as any).confirmed_date);
        return eventDate.toDateString() === date.toDateString();
      }
      // 日程調整中の場合は日程確定予定日で表示
      if ((event as any).schedule_deadline) {
        const eventDate = new Date((event as any).schedule_deadline);
        return eventDate.toDateString() === date.toDateString();
      }
      // どちらもない場合は作成日で表示
      const eventDate = new Date(event.created_at);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatWeekRange = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const startFormatted = startDate.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
    const endFormatted = endDate.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
    
    return `${startFormatted}から${endFormatted}`;
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTodayButtonText = () => {
    return '今月に戻る';
  };

  const getStatusColor = (status: string) => {
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

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-32 bg-white p-2 ${
                  !isCurrentMonth ? 'text-gray-400' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'bg-kmc-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.event_id}
                      onClick={() => onEventClick(event.event_id)}
                      className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 truncate"
                    >
                      <div className={`px-1 py-0.5 rounded text-xs ${getStatusColor(event.status)}`}>
                        {event.title}
                        {event.status === 'SCHEDULE_POLLING' && (
                          <span className="ml-1 text-orange-600">(調整中)</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2}件
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 週カレンダー表示機能を削除

  return (
    <div className="space-y-4">
      {/* カレンダーコントロール */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPrevious}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-kmc-500 text-white rounded hover:bg-kmc-600"
          >
            {getTodayButtonText()}
          </button>
          <button
            onClick={goToNext}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            →
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {formatMonth(currentDate)}
          </h2>
        </div>
        
        {/* 週カレンダーボタンを削除 */}
      </div>

      {/* 月カレンダー表示 */}
      {renderMonthView()}
    </div>
  );
} 