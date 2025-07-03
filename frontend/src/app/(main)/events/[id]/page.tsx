'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getApiClient, handleApiError } from '../../../../lib/api';
import { EventDetails, EventDetailsStatusEnum } from '../../../../generated';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const apiClient = getApiClient();
      const response = await apiClient.getEventDetails(eventId);
      if (response.data && 'allowed_roles' in response.data && Array.isArray(response.data.allowed_roles)) {
        response.data.allowed_roles = response.data.allowed_roles.filter(role => role === 'member');
      }
      setEvent(response.data as EventDetails);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: EventDetailsStatusEnum) => {
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

  const getStatusText = (status: EventDetailsStatusEnum) => {
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

  const formatMoney = (amount: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${amount.toLocaleString()}`;
    }
    return `${amount} ${currency}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kmc-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kmc-500 mx-auto"></div>
            <p className="mt-4 text-kmc-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-kmc-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">エラーが発生しました</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Link
              href="/events"
              className="text-kmc-500 hover:text-kmc-600 font-medium"
            >
              ← イベント一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-kmc-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-kmc-gray-500 text-lg">イベントが見つかりません</p>
            <Link
              href="/events"
              className="text-kmc-500 hover:text-kmc-600 font-medium mt-4 inline-block"
            >
              ← イベント一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kmc-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-kmc-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/events"
            className="text-kmc-500 hover:text-kmc-600 font-medium mb-4 inline-block flex items-center"
          >
            <span className="mr-1">←</span>
            イベント一覧に戻る
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-kmc-gray-900 mb-2">{event.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
            </div>
            
            {/* 編集ボタン */}
            <div className="flex space-x-2">
              <Link
                href={`/events/${eventId}/edit`}
                className="btn-primary"
              >
                編集
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">イベント詳細</h2>
              
              {event.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-kmc-gray-700 mb-2">説明</h3>
                  <p className="text-kmc-gray-900 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}

              {event.venue && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-kmc-gray-700 mb-2">会場</h3>
                  <p className="text-kmc-gray-900">{event.venue}</p>
                </div>
              )}

              {event.allowed_roles && event.allowed_roles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-kmc-gray-700 mb-2">参加可能な役割</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.allowed_roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-kmc-100 text-kmc-700 rounded-full text-xs font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.editable_roles && event.editable_roles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-kmc-gray-700 mb-2">編集可能な役割</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.editable_roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.tags && event.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-kmc-gray-700 mb-2">タグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-kmc-gray-100 text-kmc-gray-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.fee_settings && event.fee_settings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-kmc-gray-700 mb-2">料金設定</h3>
                  <div className="space-y-2">
                    {event.fee_settings.map((feeSetting, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-kmc-gray-50 rounded-lg">
                        <div>
                          {feeSetting.applicable_generation && (
                            <span className="text-sm text-kmc-gray-600 ml-2">
                              ({feeSetting.applicable_generation}期)
                            </span>
                          )}
                        </div>
                        <span className="font-medium">
                          {formatMoney(feeSetting.fee.amount, feeSetting.fee.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-kmc-gray-900 mb-4">イベント情報</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-kmc-gray-600">主催者:</span>
                  <p className="font-medium text-kmc-gray-900">{event.organizer_name}</p>
                </div>
                <div>
                  <span className="text-kmc-gray-600">作成日:</span>
                  <p className="font-medium text-kmc-gray-900">{formatDate(event.created_at)}</p>
                </div>
                <div>
                  <span className="text-kmc-gray-600">更新日:</span>
                  <p className="font-medium text-kmc-gray-900">{formatDate(event.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 