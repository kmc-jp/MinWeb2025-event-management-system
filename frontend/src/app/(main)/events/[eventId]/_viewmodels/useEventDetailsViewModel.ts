"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useEventDetailsViewModel = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params.eventId as string;

  // イベント詳細を取得
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.getEventDetails(eventId),
    enabled: !!eventId,
  });

  // 参加登録のミューテーション
  const { mutate: registerForEvent, isPending: isRegistering } = useMutation({
    mutationFn: () => api.registerForEvent(eventId),
    onSuccess: () => {
      // 成功時: イベント詳細を再取得
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      // TODO: トースト通知を表示
    },
    onError: (error) => {
      console.error('参加登録に失敗しました:', error);
      // TODO: トースト通知を表示
    },
  });

  // 参加登録ボタンのハンドラ
  const handleRegister = () => {
    registerForEvent();
  };

  // ステータスに基づく表示テキスト
  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return '下書き';
      case 'SCHEDULE_POLLING':
        return '日程調整中';
      case 'CONFIRMED':
        return '確定済み';
      case 'FINISHED':
        return '終了済み';
      case 'CANCELLED':
        return 'キャンセル済み';
      default:
        return status;
    }
  };

  // ステータスに基づくバッジの色
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'secondary';
      case 'SCHEDULE_POLLING':
        return 'outline';
      case 'CONFIRMED':
        return 'default';
      case 'FINISHED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // 参加登録可能かどうか
  const canRegister = event?.status === 'CONFIRMED';

  // 既に参加登録しているかどうか
  const isRegistered = event?.registrations?.some(
    (registration) => registration.user.userId === 'current-user-id' // TODO: 実際のユーザーIDを使用
  );

  return {
    event,
    isLoading,
    error,
    handleRegister,
    isRegistering,
    getStatusText,
    getStatusVariant,
    canRegister,
    isRegistered,
  };
}; 