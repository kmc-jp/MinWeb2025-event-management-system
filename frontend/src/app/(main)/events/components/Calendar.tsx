'use client';

import { useState, useEffect } from 'react';
import { EventSummary } from '../../../../generated';

interface CalendarProps {
  events: EventSummary[];
  onEventClick: (eventId: string) => void;
}

type ViewMode = 'month' | 'week';

export default function Calendar({ events, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

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

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
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
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTodayButtonText = () => {
    return viewMode === 'month' ? '今月に戻る' : '今週に戻る';
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

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map((day, index) => {
            const date = days[index];
            if (!date) return null;
            
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={day} className="bg-gray-50 p-2">
                <div className={`text-center text-sm font-medium mb-2 ${
                  isToday ? 'bg-kmc-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : 'text-gray-700'
                }`}>
                  {day}
                </div>
                <div className="text-xs text-gray-500 text-center mb-2">
                  {formatDate(date)}
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.event_id}
                      onClick={() => onEventClick(event.event_id)}
                      className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100"
                    >
                      <div className={`px-1 py-0.5 rounded text-xs ${getStatusColor(event.status)}`}>
                        {event.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
            {viewMode === 'month' ? formatMonth(currentDate) : (() => {
              const weekDays = getWeekDays(currentDate);
              return weekDays[0] ? formatWeekRange(weekDays[0]) : formatDate(currentDate);
            })()}
          </h2>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded ${
              viewMode === 'month' 
                ? 'bg-kmc-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            月
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded ${
              viewMode === 'week' 
                ? 'bg-kmc-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            週
          </button>
        </div>
      </div>

      {/* カレンダー表示 */}
      {viewMode === 'month' ? renderMonthView() : renderWeekView()}
    </div>
  );
} 