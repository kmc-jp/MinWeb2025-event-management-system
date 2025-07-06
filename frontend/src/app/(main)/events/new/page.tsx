'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiClient, handleApiError } from '../../../../lib/api';
import { CreateEventRequest, FeeSetting, Money, Role } from '../../../../generated/api';

// 日程設定を含む拡張されたCreateEventRequest型
interface ExtendedCreateEventRequest extends Omit<CreateEventRequest, 'allowed_users' | 'allowed_participation_roles' | 'allowed_edit_roles'> {
  allowed_participation_roles: string[];
  allowed_edit_roles: string[];
  allowed_users?: string[];
  schedule_type?: 'confirmed' | 'polling';
  confirmed_date?: string;
  schedule_deadline?: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<ExtendedCreateEventRequest>({
    title: '',
    description: '',
    venue: '',
    allowed_participation_roles: [],
    allowed_edit_roles: [],
    allowed_users: [],
    tags: [],
    fee_settings: [],
    poll_type: 'date_select',
    poll_candidates: [],
    schedule_type: 'confirmed', // 日程確定 or 日程調整
    confirmed_date: '', // 確定した日程
    schedule_deadline: '' // 日程確定予定日
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newPollCandidate, setNewPollCandidate] = useState('');

  useEffect(() => {
    loadTags();
    loadRoles();
  }, []);

  const loadTags = async () => {
    try {
      const response = await (getApiClient() as any).listTags();
      setTags(response.data);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await (getApiClient() as any).listRoles();
      setRoles(response.data);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const handleInputChange = (field: keyof ExtendedCreateEventRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      applicable_generation: 1,
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

  // 送信前にフィールド名をAPI用に変換
  const toApiRequest = (formData: ExtendedCreateEventRequest): CreateEventRequest => {
    const { allowed_participation_roles, allowed_edit_roles, ...rest } = formData;
    return {
      ...rest,
      allowed_participation_roles,
      allowed_edit_roles,
    } as CreateEventRequest;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiClient = getApiClient();
      
      // 日付文字列をISO 8601形式に変換する関数
      const formatDateTime = (dateTimeString: string): string => {
        if (!dateTimeString) return '';
        // datetime-localの形式（YYYY-MM-DDTHH:mm）をISO 8601形式に変換
        const date = new Date(dateTimeString);
        return date.toISOString();
      };
      
      // 日程情報を適切に処理
      const eventData = {
        ...formData,
        // 日程確定の場合は確定した日程を設定
        confirmed_date: formData.schedule_type === 'confirmed' && formData.confirmed_date 
          ? formatDateTime(formData.confirmed_date) 
          : undefined,
        // 日程調整の場合は日程確定予定日を設定
        schedule_deadline: formData.schedule_type === 'polling' && formData.schedule_deadline
          ? formatDateTime(formData.schedule_deadline)
          : undefined,
        // 日程調整の候補日時もISO 8601形式に変換
        poll_candidates: formData.poll_candidates?.map(candidate => formatDateTime(candidate)) || [],
      };
      
      console.log('Submitting event data:', eventData);
      console.log('confirmed_date:', eventData.confirmed_date);
      console.log('schedule_deadline:', eventData.schedule_deadline);
      
      const response = await apiClient.createEvent(toApiRequest(eventData));
      
      // 作成成功後、イベント詳細ページにリダイレクト
      router.push(`/events/${response.data.event_id}`);
    } catch (error) {
      console.error('Error creating event:', error);
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
              <div className="space-y-4">
                {/* 役割の選択 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                    役割を選択
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <button
                        key={role.name}
                        type="button"
                        onClick={() => {
                          if (!formData.allowed_participation_roles.includes(role.name)) {
                            setFormData(prev => ({
                              ...prev,
                              allowed_participation_roles: [...prev.allowed_participation_roles, role.name]
                            }));
                          }
                        }}
                        disabled={formData.allowed_participation_roles.includes(role.name)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          formData.allowed_participation_roles.includes(role.name)
                            ? 'bg-kmc-500 text-white border-kmc-500'
                            : 'bg-white text-kmc-700 border-kmc-300 hover:bg-kmc-50'
                        }`}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 選択された役割の表示 */}
                {formData.allowed_participation_roles.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                      選択された役割
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.allowed_participation_roles.map((roleName) => {
                        const role = roles.find(r => r.name === roleName);
                        return (
                          <span
                            key={roleName}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kmc-100 text-kmc-800"
                          >
                            {role ? role.name : roleName}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  allowed_participation_roles: prev.allowed_participation_roles.filter(r => r !== roleName)
                                }));
                              }}
                              className="ml-2 text-kmc-600 hover:text-kmc-800"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 編集可能な役割 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">編集可能な役割</h2>
              <div className="space-y-4">
                {/* 役割の選択 */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                    役割を選択
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <button
                        key={role.name}
                        type="button"
                        onClick={() => {
                          if (!formData.allowed_edit_roles?.includes(role.name)) {
                            setFormData(prev => ({
                              ...prev,
                              allowed_edit_roles: [...(prev.allowed_edit_roles || []), role.name]
                            }));
                          }
                        }}
                        disabled={formData.allowed_edit_roles?.includes(role.name)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          formData.allowed_edit_roles?.includes(role.name)
                            ? 'bg-kmc-500 text-white border-kmc-500'
                            : 'bg-white text-kmc-700 border-kmc-300 hover:bg-kmc-50'
                        }`}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 選択された役割の表示 */}
                {formData.allowed_edit_roles && formData.allowed_edit_roles.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                      選択された役割
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.allowed_edit_roles.map((roleName) => {
                        const role = roles.find(r => r.name === roleName);
                        return (
                          <span
                            key={roleName}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kmc-100 text-kmc-800"
                          >
                            {role ? role.name : roleName}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  allowed_edit_roles: (prev.allowed_edit_roles || []).filter(r => r !== roleName)
                                }));
                              }}
                              className="ml-2 text-kmc-600 hover:text-kmc-800"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 日程設定 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">日程設定</h2>
              <div className="space-y-4">
                {/* 日程タイプ選択 */}
                <div>
                  <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                    日程の設定方法 *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="schedule_type"
                        value="confirmed"
                        checked={formData.schedule_type === 'confirmed'}
                        onChange={(e) => handleInputChange('schedule_type', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-kmc-gray-700">日程を確定する</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="schedule_type"
                        value="polling"
                        checked={formData.schedule_type === 'polling'}
                        onChange={(e) => handleInputChange('schedule_type', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-kmc-gray-700">日程調整を行う</span>
                    </label>
                  </div>
                </div>

                {/* 確定した日程 */}
                {formData.schedule_type === 'confirmed' && (
                  <div>
                    <label htmlFor="confirmed_date" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                      確定した日程 *
                    </label>
                    <input
                      type="datetime-local"
                      id="confirmed_date"
                      value={formData.confirmed_date}
                      onChange={(e) => handleInputChange('confirmed_date', e.target.value)}
                      className="input-field w-full"
                      required
                    />
                  </div>
                )}

                {/* 日程確定予定日 */}
                {formData.schedule_type === 'polling' && (
                  <div>
                    <label htmlFor="schedule_deadline" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                      日程確定予定日 *
                    </label>
                    <input
                      type="date"
                      id="schedule_deadline"
                      value={formData.schedule_deadline}
                      onChange={(e) => handleInputChange('schedule_deadline', e.target.value)}
                      className="input-field w-full"
                      required
                    />
                    <p className="text-xs text-kmc-gray-500 mt-1">
                      この日までに日程を確定する予定です。カレンダーにはこの日付で表示されます。
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* タグ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">タグ</h2>
              <div className="space-y-4">
                {/* 既存タグの選択 */}
                {tags.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                      既存のタグから選択
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
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

            {/* 日程調整 - 日程調整を行う場合のみ表示 */}
            {formData.schedule_type === 'polling' && (
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
            )}

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
                            min="1"
                            max="100"
                            placeholder="1-100の範囲"
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