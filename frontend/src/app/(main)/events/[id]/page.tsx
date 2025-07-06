'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getApiClient, handleApiError } from '../../../../lib/api';
import { EventDetails, EventDetailsStatusEnum, EventParticipant, JoinEventRequest } from '../../../../generated';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId] = useState('dummy-user-001'); // 開発用：実際の認証システムから取得

  useEffect(() => {
    fetchEventDetails();
    fetchParticipants();
    fetchCurrentUser();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const apiClient = getApiClient();
      const response = await apiClient.getEventDetails(eventId);
      if (response.data && 'allowed_participation_roles' in response.data && Array.isArray(response.data.allowed_participation_roles)) {
        response.data.allowed_participation_roles = response.data.allowed_participation_roles.filter(role => role === 'member');
      }
      setEvent(response.data as EventDetails);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.listEventParticipants(eventId);
      setParticipants(response.data as EventParticipant[]);
    } catch (error) {
      console.error('参加者取得エラー:', error);
    }
  };

  const handleJoinEvent = async () => {
    try {
      setJoining(true);
      const apiClient = getApiClient();
      const request: JoinEventRequest = {
        user_id: currentUserId
      };
      await apiClient.joinEvent(eventId, request);
      await fetchParticipants(); // 参加者一覧を再取得
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    try {
      const apiClient = getApiClient();
      await apiClient.leaveEvent(eventId, currentUserId);
      await fetchParticipants(); // 参加者一覧を再取得
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.getCurrentUser();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
    }
  };

  const isParticipant = () => {
    return participants.some(p => p.user_id === currentUserId);
  };

  const canJoinEvent = () => {
    if (!event || !currentUser) return false;
    
    // 参加可能な役割を持っているかチェック
    const userRoles = currentUser.roles || [];
    const allowedRoles = event.allowed_participation_roles || [];
    
    return userRoles.some((userRole: string) => 
      allowedRoles.includes(userRole)
    );
  };

  const getStatusColor = (status: EventDetailsStatusEnum) => {
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
            
            {/* 編集ボタンと参加ボタン */}
            <div className="flex space-x-2">
              <Link
                href={`/events/${eventId}/edit`}
                className="btn-primary"
              >
                編集
              </Link>
              
              {/* 参加/退出ボタン */}
              {isParticipant() ? (
                <button
                  onClick={handleLeaveEvent}
                  className="btn-secondary"
                >
                  退出
                </button>
              ) : canJoinEvent() ? (
                <button
                  onClick={handleJoinEvent}
                  disabled={joining}
                  className="btn-primary"
                >
                  {joining ? '参加中...' : '参加する'}
                </button>
              ) : (
                <button
                  disabled
                  className="btn-disabled"
                  title="参加可能な役割を持っていません"
                >
                  参加不可
                </button>
              )}
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

              {event.allowed_participation_roles && event.allowed_participation_roles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-kmc-gray-700 mb-2">参加可能な役割</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.allowed_participation_roles.map((role) => (
                      <span
                        key={role}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          currentUser && currentUser.roles && currentUser.roles.includes(role)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-kmc-100 text-kmc-700'
                        }`}
                      >
                        {role}
                        {currentUser && currentUser.roles && currentUser.roles.includes(role) && (
                          <span className="ml-1">✓</span>
                        )}
                      </span>
                    ))}
                  </div>
                  {currentUser && !canJoinEvent() && (
                    <p className="text-sm text-red-600 mt-2">
                      あなたは参加可能な役割を持っていません
                    </p>
                  )}
                </div>
              )}

              {event.allowed_edit_roles && event.allowed_edit_roles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-kmc-gray-700 mb-2">編集可能な役割</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.allowed_edit_roles.map((role) => (
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

            {/* 参加者一覧 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-kmc-gray-900 mb-4">参加者一覧</h3>
              {participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.user_id} className="flex items-center justify-between p-3 bg-kmc-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-kmc-gray-900">{participant.name}</p>
                        <p className="text-sm text-kmc-gray-600">{participant.generation}期</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          participant.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-700'
                            : participant.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {participant.status === 'CONFIRMED' ? '確定' : 
                           participant.status === 'PENDING' ? '保留' : 'キャンセル'}
                        </span>
                        <span className="text-xs text-kmc-gray-500">
                          {formatDate(participant.joined_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-kmc-gray-500 text-center py-4">まだ参加者がいません</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 