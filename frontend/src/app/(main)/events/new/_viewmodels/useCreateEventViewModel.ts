"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// バリデーションスキーマ
const createEventSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
  description: z.string().max(1000, '説明は1000文字以内で入力してください'),
  venue: z.string().min(1, '会場は必須です').max(200, '会場は200文字以内で入力してください'),
  allowedRoles: z.array(z.string()).min(1, '参加可能な役割を1つ以上選択してください'),
  tags: z.array(z.string()).optional(),
  feeSettings: z.array(z.object({
    applicableRole: z.string().min(1, '役割は必須です'),
    applicableGeneration: z.string().optional(),
    fee: z.object({
      amount: z.number().min(0, '金額は0以上で入力してください'),
      currency: z.string().default('JPY'),
    }),
  })).optional(),
  pollCandidates: z.array(z.string()).min(1, '日程候補を1つ以上入力してください'),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

// 役割の選択肢
const ROLE_OPTIONS = [
  { value: 'CircleAdmin', label: 'サークル管理者' },
  { value: 'RegularMember', label: '正規メンバー' },
  { value: 'Alumni', label: 'OB/OG' },
  { value: 'External', label: '外部参加者' },
];

export const useCreateEventViewModel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // フォームの初期化
  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      venue: '',
      allowedRoles: [],
      tags: [],
      feeSettings: [
        {
          applicableRole: 'RegularMember',
          applicableGeneration: '',
          fee: { amount: 0, currency: 'JPY' },
        },
      ],
      pollCandidates: [],
    },
  });

  // イベント作成のミューテーション
  const { mutate: createEvent, isPending } = useMutation({
    mutationFn: (data: CreateEventFormData) => api.createEvent(data),
    onSuccess: (data) => {
      // 成功時: キャッシュを無効化し、一覧を再取得させる
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // 作成されたイベントの詳細ページにリダイレクト
      router.push(`/events/${data.eventId}`);
    },
    onError: (error) => {
      // エラーハンドリング
      console.error('イベント作成に失敗しました:', error);
      // TODO: トースト通知を表示
    },
  });

  // フォーム送信時のハンドラ
  const onSubmit = (values: CreateEventFormData) => {
    // 空のタグをフィルタリング
    const filteredValues = {
      ...values,
      tags: values.tags?.filter(tag => tag.trim() !== '') || [],
      pollCandidates: values.pollCandidates?.filter(date => date.trim() !== '') || [],
      feeSettings: values.feeSettings || [],
    };
    
    createEvent(filteredValues);
  };

  // 料金設定を追加
  const addFeeSetting = () => {
    const currentFeeSettings = form.getValues('feeSettings') || [];
    form.setValue('feeSettings', [
      ...currentFeeSettings,
      {
        applicableRole: 'RegularMember',
        applicableGeneration: '',
        fee: { amount: 0, currency: 'JPY' },
      },
    ]);
  };

  // 料金設定を削除
  const removeFeeSetting = (index: number) => {
    const currentFeeSettings = form.getValues('feeSettings') || [];
    if (currentFeeSettings.length > 1) {
      form.setValue('feeSettings', currentFeeSettings.filter((_, i) => i !== index));
    }
  };

  // 日程候補を追加
  const addPollCandidate = () => {
    const currentCandidates = form.getValues('pollCandidates') || [];
    form.setValue('pollCandidates', [...currentCandidates, '']);
  };

  // 日程候補を削除
  const removePollCandidate = (index: number) => {
    const currentCandidates = form.getValues('pollCandidates') || [];
    if (currentCandidates.length > 1) {
      form.setValue('pollCandidates', currentCandidates.filter((_, i) => i !== index));
    }
  };

  // タグを追加
  const addTag = () => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', [...currentTags, '']);
  };

  // タグを削除
  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter((_, i) => i !== index));
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: isPending,
    roleOptions: ROLE_OPTIONS,
    addFeeSetting,
    removeFeeSetting,
    addPollCandidate,
    removePollCandidate,
    addTag,
    removeTag,
  };
}; 