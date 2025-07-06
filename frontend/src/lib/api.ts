import { DefaultApi, Configuration, PaginatedEventList, EventSummaryStatusEnum, UpdateEventRequest, CreateEventRequest } from '../generated';
import { isDevelopment } from './constants';

// 認証ヘッダーを取得する関数
const getAuthHeaders = () => {
  if (typeof window !== 'undefined' && isDevelopment) {
    // 開発環境: ローカルストレージから認証情報を取得
    const mockUserData = localStorage.getItem('mockUser');
    if (mockUserData) {
      try {
        const mockUser = JSON.parse(mockUserData);
        return {
          'X-User-ID': mockUser.user_id,
          'X-User-Roles': Array.isArray(mockUser.roles) ? mockUser.roles.join(',') : mockUser.roles,
          'X-User-Generation': mockUser.generation.toString(),
        };
      } catch (error) {
        console.error('Mockユーザーデータの解析に失敗しました:', error);
        return {};
      }
    }
  } else {
    // 本番環境: 実際の認証トークンやセッション情報を取得
    const token = localStorage.getItem('authToken');
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      };
    }
  }
  return {};
};

// APIクライアントの設定
const configuration = new Configuration({
  basePath: typeof window !== 'undefined' 
    ? window.location.origin.replace('3000', '8080') 
    : 'http://localhost:8080',
});

// APIクライアントのインスタンスを作成
export const apiClient = new DefaultApi(configuration);

// 認証済みAPIクライアント
class AuthenticatedApiClient extends DefaultApi {
  constructor() {
    super(configuration);
  }

  // 認証ヘッダーを追加したリクエスト設定
  private getAuthenticatedConfig() {
    const headers = getAuthHeaders();
    return {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      }
    };
  }

  // 現在のユーザー情報を取得（環境に応じて適切な方法を使用）
  async getCurrentUser() {
    if (typeof window !== 'undefined' && isDevelopment) {
      // 開発環境: ローカルストレージから取得
      const mockUserData = localStorage.getItem('mockUser');
      if (mockUserData) {
        const mockUser = JSON.parse(mockUserData);
        // AxiosResponseの形式に合わせる
        return {
          data: {
            user_id: mockUser.user_id,
            roles: mockUser.roles,
            generation: mockUser.generation,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any
        };
      }
      throw new Error('開発環境でユーザー情報が見つかりません');
    } else {
      // 本番環境: APIから取得
      return super.getCurrentUser(this.getAuthenticatedConfig());
    }
  }

  // 開発環境用のgetCurrentUserInfo（後方互換性のため残す）
  async getCurrentUserInfo() {
    return this.getCurrentUser();
  }

  // 役割一覧を取得
  async listRoles() {
    return super.listRoles(this.getAuthenticatedConfig());
  }

  // 役割詳細を取得
  async getRoleDetails(roleName: string) {
    return super.getRoleDetails(roleName, this.getAuthenticatedConfig());
  }

  // 役割を更新
  async updateRole(roleName: string, roleData: { description: string }) {
    return super.updateRole(roleName, roleData, this.getAuthenticatedConfig());
  }

  // タグ一覧を取得
  async listTags() {
    return super.listTags(this.getAuthenticatedConfig());
  }

  // 新しいタグを作成
  async createTag(tagData: { name: string }) {
    return super.createTag(tagData, this.getAuthenticatedConfig());
  }

  // 新しい役割を作成
  async createRole(roleData: { name: string; description: string }) {
    return super.createRole(roleData, this.getAuthenticatedConfig());
  }

  // 役割を削除
  async deleteRole(roleName: string) {
    return super.deleteRole(roleName, this.getAuthenticatedConfig());
  }

  // ユーザーに役割を付与
  async assignRoleToUser(userId: string, assignRoleRequest: { role_name: string }) {
    return super.assignRoleToUser(userId, assignRoleRequest, this.getAuthenticatedConfig());
  }

  // ユーザーから役割を削除
  async removeRoleFromUser(userId: string, roleName: string) {
    return super.removeRoleFromUser(userId, roleName, this.getAuthenticatedConfig());
  }

  // ユーザー一覧を取得
  async listUsers(role?: string, generation?: string) {
    return super.listUsers(role, generation, this.getAuthenticatedConfig());
  }

  // ユーザー情報を取得
  async getUser(id: string) {
    return super.getUser(id, this.getAuthenticatedConfig());
  }

  // イベント作成
  async createEvent(createEventRequest: CreateEventRequest) {
    return super.createEvent(createEventRequest, this.getAuthenticatedConfig());
  }

  // イベント詳細を取得
  async getEventDetails(id: string) {
    return super.getEventDetails(id, this.getAuthenticatedConfig());
  }

  // イベントを更新
  async updateEvent(id: string, updateEventRequest: UpdateEventRequest) {
    return super.updateEvent(id, updateEventRequest, this.getAuthenticatedConfig());
  }

  // イベントを削除
  async deleteEvent(id: string) {
    return super.deleteEvent(id, this.getAuthenticatedConfig());
  }

  // イベント一覧を取得
  async listEvents(page?: number, pageSize?: number, status?: string, tags?: string, participation?: 'all' | 'joinable' | 'joined') {
    return super.listEvents(page, pageSize, status as any, tags, participation, this.getAuthenticatedConfig());
  }

  // ヘルスチェック
  async healthCheck() {
    return super.healthCheck(this.getAuthenticatedConfig());
  }

  // イベント参加者一覧を取得
  async listEventParticipants(id: string) {
    return super.listEventParticipants(id, this.getAuthenticatedConfig());
  }

  // イベントに参加
  async joinEvent(id: string, joinEventRequest: { user_id: string }) {
    return super.joinEvent(id, joinEventRequest, this.getAuthenticatedConfig());
  }

  // イベントから退出
  async leaveEvent(id: string, userId: string) {
    return super.leaveEvent(id, userId, this.getAuthenticatedConfig());
  }

  // 日程確定
  async confirmEventSchedule(id: string, confirmEventScheduleRequest: { confirmed_date: string }) {
    return super.confirmEventSchedule(id, confirmEventScheduleRequest, this.getAuthenticatedConfig());
  }
}

// 認証済みAPIクライアントのインスタンスを作成
const createAuthenticatedApiClient = () => {
  return new AuthenticatedApiClient();
};

// APIクライアントを取得する関数
export const getApiClient = () => {
  return createAuthenticatedApiClient();
};

// 認証情報を取得するユーティリティ関数
export const getAuthInfo = () => {
  if (typeof window !== 'undefined' && isDevelopment) {
    const mockUserData = localStorage.getItem('mockUser');
    if (mockUserData) {
      return JSON.parse(mockUserData);
    }
  } else {
    const token = localStorage.getItem('authToken');
    if (token) {
      return { token };
    }
  }
  return null;
};

// 認証情報を設定するユーティリティ関数
export const setAuthInfo = (authData: any) => {
  if (typeof window !== 'undefined' && isDevelopment) {
    localStorage.setItem('mockUser', JSON.stringify(authData));
  } else {
    if (authData.token) {
      localStorage.setItem('authToken', authData.token);
    }
  }
};

// 認証情報をクリアするユーティリティ関数
export const clearAuthInfo = () => {
  if (typeof window !== 'undefined') {
    if (isDevelopment) {
      localStorage.removeItem('mockUser');
    } else {
      localStorage.removeItem('authToken');
    }
  }
};

// APIエラーハンドリング
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    if (response?.data?.error) {
      return response.data.error;
    }
    if (response?.status === 401) {
      return '認証が必要です。ログインしてください。';
    }
    if (response?.status === 403) {
      return '権限がありません。';
    }
    if (response?.status === 404) {
      return 'リソースが見つかりません。';
    }
    if (response?.status >= 500) {
      return 'サーバーエラーが発生しました。';
    }
  }
  return '予期しないエラーが発生しました。';
}; 