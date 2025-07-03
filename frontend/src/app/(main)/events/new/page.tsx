'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiClient, handleApiError } from '../../../../lib/api';
import { CreateEventRequest, UserRole, FeeSetting, Money } from '../../../../generated/api';

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
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newPollCandidate, setNewPollCandidate] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await (getApiClient() as any).listTags();
      setAvailableTags(response.data);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const userRoles: UserRole[] = ['member', 'admin'];
  const userRoleLabels: { [key in UserRole]: string } = {
    'member': '部員',
    'admin': '管理者',
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

  const createAndAddTag = async () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      try {
        // 新しいタグを作成
        await (getApiClient() as any).createTag({ name: newTag.trim() });
        // タグ一覧を再読み込み
        await loadTags();
        // フォームに追加
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag.trim()]
        }));
        setNewTag('');
      } catch (err) {
        console.error('Failed to create tag:', err);
        // 作成に失敗した場合は既存のタグとして追加
        addTag();
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addPollCandidate = () => {
    if (newPollCandidate.trim() && !formData.poll_candidates?.includes(newPollCandidate.trim())) {
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
      applicable_generation: 2024,
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
    setLoading(true);
    setError(null);

    try {
      const apiClient = getApiClient();
      const response = await apiClient.createEvent(formData);
      
      // 作成成功後、イベント詳細ページにリダイレクト
      router.push(`/events/${response.data.event_id}`);
    } catch (error) {
      setError(handleApiError(error));
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
                  <label htmlFor="title" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    イベントタイトル *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    説明
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label htmlFor="venue" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    会場
                  </label>
                  <input
                    type="text"
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>

            {/* 参加可能な役割 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">参加可能な役割</h2>
              <div className="grid grid-cols-2 gap-3">
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
              <div className="space-y-4">
                {/* 既存タグの選択 */}
                {availableTags.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                      既存のタグから選択
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.name}
                          type="button"
                          onClick={() => {
                            if (!formData.tags?.includes(tag.name)) {
                              setFormData(prev => ({
                                ...prev,
                                tags: [...(prev.tags || []), tag.name]
                              }));
                            }
                          }}
                          disabled={formData.tags?.includes(tag.name)}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            formData.tags?.includes(tag.name)
                              ? 'bg-kmc-500 text-white border-kmc-500'
                              : 'bg-white text-kmc-700 border-kmc-300 hover:bg-kmc-50'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 新規タグ作成 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="新しいタグを作成"
                    className="input-field flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        createAndAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={createAndAddTag}
                    className="btn-primary"
                    disabled={!newTag.trim()}
                  >
                    作成
                  </button>
                </div>
                
                {/* 選択されたタグの表示 */}
                {formData.tags && formData.tags.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                      選択されたタグ
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kmc-100 text-kmc-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-kmc-600 hover:text-kmc-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 日程調整 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">日程調整</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="poll_type" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    調整タイプ
                  </label>
                  <select
                    id="poll_type"
                    value={formData.poll_type}
                    onChange={(e) => handleInputChange('poll_type', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="date_select">日付選択</option>
                    <option value="time_select">時間選択</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    候補日時
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={newPollCandidate}
                      onChange={(e) => setNewPollCandidate(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={addPollCandidate}
                      className="btn-secondary"
                    >
                      追加
                    </button>
                  </div>
                  {formData.poll_candidates && formData.poll_candidates.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.poll_candidates.map((candidate) => (
                        <div
                          key={candidate}
                          className="flex items-center justify-between p-2 bg-kmc-gray-50 rounded"
                        >
                          <span className="text-sm">{new Date(candidate).toLocaleString('ja-JP')}</span>
                          <button
                            type="button"
                            onClick={() => removePollCandidate(candidate)}
                            className="text-kmc-500 hover:text-kmc-700"
                          >
                            ×
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
                            世代
                          </label>
                          <input
                            type="number"
                            value={feeSetting.applicable_generation}
                            onChange={(e) => updateFeeSetting(index, 'applicable_generation', Number(e.target.value))}
                            className="input-field w-full"
                            placeholder="例: 2024"
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
            <div className="flex justify-end space-x-4">
              <Link
                href="/events"
                className="btn-secondary"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
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