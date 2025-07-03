'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getApiClient, handleApiError } from '../../../../../lib/api';
import { UpdateEventRequest, FeeSetting, Money } from '../../../../../generated/api';
import { ROLE_LABELS } from '../../../../../lib/constants';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [formData, setFormData] = useState<UpdateEventRequest>({
    title: '',
    description: '',
    venue: '',
    allowed_roles: [],
    editable_roles: [],
    tags: [],
    fee_settings: []
  } as any);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');
  useEffect(() => {
    loadEventDetails();
    loadTags();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const response = await (getApiClient() as any).getEventDetails(eventId);
      const event = response.data;
      
      setFormData({
        title: event.title,
        description: event.description || '',
        venue: event.venue || '',
        allowed_roles: event.allowed_roles || [],
        editable_roles: event.editable_roles || [],
        tags: event.tags || [],
        fee_settings: event.fee_settings || []
      } as any);
    } catch (err) {
      console.error('Failed to load event details:', err);
      setError('イベントの詳細を読み込めませんでした');
    }
  };

  const loadTags = async () => {
    try {
      const response = await (getApiClient() as any).listTags();
      setAvailableTags(response.data);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const userRoles: string[] = ['member', 'admin'];

  const handleInputChange = (field: keyof UpdateEventRequest, value: any) => {
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
        await (getApiClient() as any).createTag({ name: newTag.trim() });
        await loadTags();
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag.trim()]
        }));
        setNewTag('');
      } catch (err) {
        console.error('Failed to create tag:', err);
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
      const response = await apiClient.updateEvent(eventId, formData);
      
      router.push(`/events/${eventId}`);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kmc-gray-50">
      <header className="bg-white shadow-sm border-b border-kmc-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/events/${eventId}`}
            className="text-kmc-500 hover:text-kmc-600 font-medium mb-4 inline-block flex items-center"
          >
            <span className="mr-1">←</span>
            イベント詳細に戻る
          </Link>
          <h1 className="text-3xl font-bold text-kmc-gray-900">イベント編集</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

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

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">参加可能な役割</h2>
              <div className="space-y-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                    役割を選択
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          if (!formData.allowed_roles.includes(role)) {
                            setFormData(prev => ({
                              ...prev,
                              allowed_roles: [...prev.allowed_roles, role]
                            }));
                          }
                        }}
                        disabled={formData.allowed_roles.includes(role)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          formData.allowed_roles.includes(role)
                            ? 'bg-kmc-500 text-white border-kmc-500'
                            : 'bg-white text-kmc-700 border-kmc-300 hover:bg-kmc-50'
                        }`}
                      >
                        {ROLE_LABELS[role]}
                      </button>
                    ))}
                  </div>
                </div>
                
                {formData.allowed_roles.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                      選択された役割
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.allowed_roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kmc-100 text-kmc-800"
                        >
                          {ROLE_LABELS[role]}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                allowed_roles: prev.allowed_roles.filter(r => r !== role)
                              }));
                            }}
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

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">編集可能な役割</h2>
              <div className="space-y-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                    役割を選択
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          if (!formData.editable_roles.includes(role)) {
                            setFormData(prev => ({
                              ...prev,
                              editable_roles: [...prev.editable_roles, role]
                            }));
                          }
                        }}
                        disabled={formData.editable_roles.includes(role)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          formData.editable_roles.includes(role)
                            ? 'bg-kmc-500 text-white border-kmc-500'
                            : 'bg-white text-kmc-700 border-kmc-300 hover:bg-kmc-50'
                        }`}
                      >
                        {ROLE_LABELS[role]}
                      </button>
                    ))}
                  </div>
                </div>
                
                {formData.editable_roles.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-kmc-gray-600 mb-2">
                      選択された役割
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.editable_roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kmc-100 text-kmc-800"
                        >
                          {ROLE_LABELS[role]}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                editable_roles: prev.editable_roles.filter(r => r !== role)
                              }));
                            }}
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

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">タグ</h2>
              <div className="space-y-4">
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
                            onChange={(e) => updateFeeSetting(index, 'fee', { ...feeSetting.fee, amount: Number(e.target.value) })}
                            className="input-field w-full"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                            通貨
                          </label>
                          <select
                            value={feeSetting.fee.currency}
                            onChange={(e) => updateFeeSetting(index, 'fee', { ...feeSetting.fee, currency: e.target.value })}
                            className="input-field w-full"
                          >
                            <option value="JPY">JPY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeFeeSetting(index)}
                            className="btn-danger w-full"
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

            <div className="flex justify-end space-x-4">
              <Link
                href={`/events/${eventId}`}
                className="btn-secondary"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? '更新中...' : '更新'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 