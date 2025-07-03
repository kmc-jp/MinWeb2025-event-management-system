'use client';

import { useState, useEffect } from 'react';
import { getApiClient, handleApiError } from '../../../../lib/api';
import { Tag } from '../../../../generated';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const apiClient = getApiClient();
      const response = await apiClient.listTags();
      setTags(response.data);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(tag => tag !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(newSelectedTags);
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  const selectedTagsText = selectedTags.length > 0 
    ? `${selectedTags.length}個のタグを選択中`
    : 'タグで絞り込み';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-kmc-500 focus:border-kmc-500"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="text-sm text-gray-700">{selectedTagsText}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">タグを選択</h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-kmc-600 hover:text-kmc-700"
                >
                  すべてクリア
                </button>
              )}
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-kmc-500 mx-auto"></div>
                <p className="mt-2 text-xs text-gray-500">読み込み中...</p>
              </div>
            ) : error ? (
              <div className="p-3 text-center">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            ) : tags.length === 0 ? (
              <div className="p-3 text-center">
                <p className="text-xs text-gray-500">タグがありません</p>
              </div>
            ) : (
              <div className="p-2">
                {tags.map((tag) => (
                  <label
                    key={tag.name}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.name)}
                      onChange={() => handleTagToggle(tag.name)}
                      className="h-4 w-4 text-kmc-600 focus:ring-kmc-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 