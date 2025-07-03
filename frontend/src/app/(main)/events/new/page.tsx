'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, handleApiError } from '../../../../lib/api';
import { CreateEventRequest, UserRole, FeeSetting, Money } from '../../../../generated';

export default function CreateEventPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    venue: '',
    allowed_roles: [],
    tags: [],
    fee_settings: [],
    poll_type: 'date_select',
    poll_candidates: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newPollCandidate, setNewPollCandidate] = useState('');

  const userRoles: UserRole[] = ['CircleAdmin', 'RegularMember', 'Alumni', 'External'];

  const handleInputChange = (field: keyof CreateEventRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleToggle = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      allowed_roles: prev.allowed_roles.includes(role)
        ? prev.allowed_roles.filter(r => r !== role)
        : [...prev.allowed_roles, role]
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addPollCandidate = () => {
    if (newPollCandidate.trim()) {
      setFormData(prev => ({
        ...prev,
        poll_candidates: [...(prev.poll_candidates || []), newPollCandidate.trim()]
      }));
      setNewPollCandidate('');
    }
  };

  const removePollCandidate = (candidateToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      poll_candidates: prev.poll_candidates?.filter(candidate => candidate !== candidateToRemove) || []
    }));
  };

  const addFeeSetting = () => {
    const newFeeSetting: FeeSetting = {
      applicable_role: 'RegularMember',
      applicable_generation: '',
      fee: {
        amount: 0,
        currency: 'JPY'
      }
    };
    setFormData(prev => ({
      ...prev,
      fee_settings: [...(prev.fee_settings || []), newFeeSetting]
    }));
  };

  const updateFeeSetting = (index: number, field: keyof FeeSetting, value: any) => {
    setFormData(prev => ({
      ...prev,
      fee_settings: prev.fee_settings?.map((setting, i) => 
        i === index ? { ...setting, [field]: value } : setting
      ) || []
    }));
  };

  const removeFeeSetting = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fee_settings: prev.fee_settings?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('タイトルは必須です');
      return;
    }
    
    if (formData.allowed_roles.length === 0) {
      setError('参加可能な役割を少なくとも1つ選択してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.createEvent(formData);
      router.push(`/events/${response.data.event_id}`);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
          >
            ← イベント一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新規イベント作成</h1>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* 基本情報 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="イベントのタイトルを入力"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="イベントの説明を入力"
                    maxLength={1000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会場
                  </label>
                  <input
                    type="text"
                    value={formData.venue || ''}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="会場を入力"
                    maxLength={200}
                  />
                </div>
              </div>
            </div>

            {/* 参加可能な役割 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                参加可能な役割 <span className="text-red-500">*</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {userRoles.map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowed_roles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* タグ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">タグ</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="タグを入力"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  追加
                </button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 日程調整 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">日程調整</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日程調整タイプ
                  </label>
                  <select
                    value={formData.poll_type}
                    onChange={(e) => handleInputChange('poll_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date_select">日付選択</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日程候補
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="datetime-local"
                      value={newPollCandidate}
                      onChange={(e) => setNewPollCandidate(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addPollCandidate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      追加
                    </button>
                  </div>
                  {formData.poll_candidates && formData.poll_candidates.length > 0 && (
                    <div className="space-y-2">
                      {formData.poll_candidates.map((candidate, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <span className="text-sm">{new Date(candidate).toLocaleString('ja-JP')}</span>
                          <button
                            type="button"
                            onClick={() => removePollCandidate(candidate)}
                            className="text-red-600 hover:text-red-800"
                          >
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 料金設定 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">料金設定</h2>
                <button
                  type="button"
                  onClick={addFeeSetting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  料金設定を追加
                </button>
              </div>
              
              {formData.fee_settings && formData.fee_settings.length > 0 && (
                <div className="space-y-4">
                  {formData.fee_settings.map((feeSetting, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            役割
                          </label>
                          <select
                            value={feeSetting.applicable_role}
                            onChange={(e) => updateFeeSetting(index, 'applicable_role', e.target.value as UserRole)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {userRoles.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            世代
                          </label>
                          <input
                            type="text"
                            value={feeSetting.applicable_generation || ''}
                            onChange={(e) => updateFeeSetting(index, 'applicable_generation', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="例: 2023"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            料金
                          </label>
                          <input
                            type="number"
                            value={feeSetting.fee.amount}
                            onChange={(e) => updateFeeSetting(index, 'fee', { ...feeSetting.fee, amount: parseInt(e.target.value) || 0 })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeFeeSetting(index)}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end gap-4">
              <Link
                href="/events"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '作成中...' : 'イベントを作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 