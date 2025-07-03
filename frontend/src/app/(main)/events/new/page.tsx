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
  const userRoleLabels: { [key in UserRole]: string } = {
    CircleAdmin: '運営',
    RegularMember: '一般部員',
    Alumni: 'OB・OG',
    External: '外部の方',
  };

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
          <h1 className="text-3xl font-bold text-kmc-gray-900">新規イベント作成</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フォーム */}
        <div className="card overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* 基本情報 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">基本情報</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="input-field w-full"
                    placeholder="イベントのタイトルを入力"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    説明
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="input-field w-full"
                    placeholder="イベントの説明を入力"
                    maxLength={1000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    会場
                  </label>
                  <input
                    type="text"
                    value={formData.venue || ''}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className="input-field w-full"
                    placeholder="会場を入力"
                    maxLength={200}
                  />
                </div>
              </div>
            </div>

            {/* 参加可能な役割 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">
                参加可能な役割 <span className="text-red-500">*</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {userRoles.map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowed_roles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="rounded border-kmc-gray-300 text-kmc-500 focus:ring-kmc-500"
                    />
                    <span className="ml-2 text-sm text-kmc-gray-700">{userRoleLabels[role]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* タグ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">タグ</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input-field flex-1"
                  placeholder="タグを入力"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-primary"
                >
                  追加
                </button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-kmc-100 text-kmc-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-kmc-600 hover:text-kmc-700"
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
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">日程調整</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    日程調整タイプ
                  </label>
                  <select
                    value={formData.poll_type}
                    onChange={(e) => handleInputChange('poll_type', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="date_select">日付選択</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    日程候補
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="datetime-local"
                      value={newPollCandidate}
                      onChange={(e) => setNewPollCandidate(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={addPollCandidate}
                      className="btn-primary"
                    >
                      追加
                    </button>
                  </div>
                  {formData.poll_candidates && formData.poll_candidates.length > 0 && (
                    <div className="space-y-2">
                      {formData.poll_candidates.map((candidate, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-kmc-gray-50 rounded-md"
                        >
                          <span className="text-sm">{new Date(candidate).toLocaleString('ja-JP')}</span>
                          <button
                            type="button"
                            onClick={() => removePollCandidate(candidate)}
                            className="text-red-600 hover:text-red-700"
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
                <h2 className="text-xl font-semibold text-kmc-gray-900">料金設定</h2>
                <button
                  type="button"
                  onClick={addFeeSetting}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  料金設定を追加
                </button>
              </div>
              
              {formData.fee_settings && formData.fee_settings.length > 0 && (
                <div className="space-y-4">
                  {formData.fee_settings.map((feeSetting, index) => (
                    <div key={index} className="border border-kmc-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                            役割
                          </label>
                          <select
                            value={feeSetting.applicable_role}
                            onChange={(e) => updateFeeSetting(index, 'applicable_role', e.target.value as UserRole)}
                            className="input-field w-full"
                          >
                            {userRoles.map((role) => (
                              <option key={role} value={role}>{userRoleLabels[role]}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                            世代
                          </label>
                          <input
                            type="text"
                            value={feeSetting.applicable_generation || ''}
                            onChange={(e) => updateFeeSetting(index, 'applicable_generation', e.target.value)}
                            className="input-field w-full"
                            placeholder="例: 2023"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                            料金
                          </label>
                          <input
                            type="number"
                            value={feeSetting.fee.amount}
                            onChange={(e) => updateFeeSetting(index, 'fee', { ...feeSetting.fee, amount: parseInt(e.target.value) || 0 })}
                            className="input-field w-full"
                            min="0"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeFeeSetting(index)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
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
                className="btn-secondary"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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