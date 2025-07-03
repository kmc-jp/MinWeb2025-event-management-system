'use client';

import { useState, useEffect } from 'react';
import { getApiClient, handleApiError } from '../../../lib/api';
import { Role, CreateRoleRequest } from '../../../generated/api';

// 型定義を直接定義
interface UpdateRoleRequest {
  description: string;
}

interface RoleDetails {
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  users: Array<{
    user_id: string;
    name: string;
    generation: string;
  }>;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<CreateRoleRequest>({
    name: '',
    description: ''
  });
  const [editRole, setEditRole] = useState<UpdateRoleRequest>({
    description: ''
  });
  const [roleDetails, setRoleDetails] = useState<RoleDetails | null>(null);
  const [addUserId, setAddUserId] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await getApiClient().listRoles();
      setRoles(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await getApiClient().createRole(newRole);
      setNewRole({ name: '', description: '' });
      setShowCreateForm(false);
      loadRoles();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleEditRole = async (roleName: string) => {
    try {
      const response = await (getApiClient() as any).getRoleDetails(roleName);
      setEditRole({ description: response.data.description });
      setEditingRole(roleName);
      setRoleDetails(response.data);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    try {
      await (getApiClient() as any).updateRole(editingRole, editRole);
      setEditingRole(null);
      setEditRole({ description: '' });
      loadRoles();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleAddUserToRole = async () => {
    if (!editingRole || !addUserId) return;
    try {
      await (getApiClient() as any).assignRoleToUser(addUserId, { role_name: editingRole });
      // 役割詳細を再取得
      const response = await (getApiClient() as any).getRoleDetails(editingRole);
      setRoleDetails(response.data);
      setAddUserId('');
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    if (!confirm(`役割 "${roleName}" を削除しますか？`)) {
      return;
    }

    try {
      await getApiClient().deleteRole(roleName);
      loadRoles();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kmc-gray-900">役割管理</h1>
        <p className="mt-2 text-kmc-gray-600">システム内の役割を管理します</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? 'キャンセル' : '新しい役割を作成'}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 card p-6">
          <h2 className="text-xl font-semibold text-kmc-gray-900 mb-4">新しい役割を作成</h2>
          <form onSubmit={handleCreateRole} className="space-y-4">
            <div>
              <label htmlFor="roleName" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                役割名
              </label>
              <input
                type="text"
                id="roleName"
                value={newRole.name}
                onChange={(e) => setNewRole((prev: CreateRoleRequest) => ({ ...prev, name: e.target.value }))}
                className="input-field w-full"
                required
                maxLength={50}
              />
            </div>
            <div>
              <label htmlFor="roleDescription" className="block text-sm font-medium text-kmc-gray-700 mb-2">
                説明
              </label>
              <textarea
                id="roleDescription"
                value={newRole.description}
                onChange={(e) => setNewRole((prev: CreateRoleRequest) => ({ ...prev, description: e.target.value }))}
                className="input-field w-full"
                rows={3}
                required
                maxLength={200}
              />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                作成
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="px-6 py-4 border-b border-kmc-gray-200">
          <h2 className="text-lg font-medium text-kmc-gray-900">役割一覧</h2>
        </div>
        <div className="divide-y divide-kmc-gray-200">
          {roles.length === 0 ? (
            <div className="px-6 py-8 text-center text-kmc-gray-500">
              役割がありません
            </div>
          ) : (
            roles.map((role) => (
              <div key={role.name} className="px-6 py-4">
                {editingRole === role.name ? (
                  <>
                    <form onSubmit={handleUpdateRole} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                          役割名: {role.name}
                        </label>
                        <label className="block text-sm font-medium text-kmc-gray-700 mb-2">
                          説明
                        </label>
                        <textarea
                          value={editRole.description}
                          onChange={(e) => setEditRole((prev: UpdateRoleRequest) => ({ ...prev, description: e.target.value }))}
                          className="input-field w-full"
                          rows={3}
                          required
                          maxLength={200}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button type="submit" className="btn-primary text-sm">
                          更新
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingRole(null); setRoleDetails(null); }}
                          className="btn-secondary text-sm"
                        >
                          キャンセル
                        </button>
                      </div>
                    </form>
                    {/* ユーザー追加UI */}
                    <div className="mt-6">
                      <h4 className="font-bold mb-2">この役割にユーザーを追加</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={addUserId}
                          onChange={e => setAddUserId(e.target.value)}
                          placeholder="ユーザーID"
                          className="input-field"
                        />
                        <button
                          type="button"
                          onClick={handleAddUserToRole}
                          className="btn-primary"
                          disabled={!addUserId}
                        >
                          追加
                        </button>
                      </div>
                      {/* 追加済みユーザー一覧 */}
                      <div className="mt-4">
                        <h5 className="font-semibold mb-1">この役割のユーザー</h5>
                        <ul className="list-disc pl-5">
                          {roleDetails?.users.map(user => (
                            <li key={user.user_id}>{user.name}（{user.user_id} / {user.generation}）</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-kmc-gray-900">{role.name}</h3>
                      <p className="text-sm text-kmc-gray-600 mt-1">{role.description}</p>
                      <div className="text-xs text-kmc-gray-500 mt-2">
                        作成者: {role.created_by} | 作成日: {new Date(role.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRole(role.name)}
                        className="btn-secondary text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.name)}
                        className="btn-danger text-sm"
                        disabled={role.name === 'admin' || role.name === 'member'}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 