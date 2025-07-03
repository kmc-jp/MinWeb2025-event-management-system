'use client';

import { useState, useEffect } from 'react';
import { getApiClient } from '../../../../lib/api';

export type ParticipationFilterType = 'all' | 'joinable' | 'joined';

interface ParticipationFilterProps {
  selectedFilter: ParticipationFilterType;
  onFilterChange: (filter: ParticipationFilterType) => void;
}

export default function ParticipationFilter({ selectedFilter, onFilterChange }: ParticipationFilterProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.getCurrentUser();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">参加状況:</span>
        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">参加状況:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            selectedFilter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          全て
        </button>
        <button
          onClick={() => onFilterChange('joinable')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            selectedFilter === 'joinable'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="参加可能な役割を持つイベント（参加済みも含む）"
        >
          参加可能
        </button>
        <button
          onClick={() => onFilterChange('joined')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            selectedFilter === 'joined'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="参加済みのイベントのみ"
        >
          参加済み
        </button>
      </div>
    </div>
  );
} 