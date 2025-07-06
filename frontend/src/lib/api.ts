import { DefaultApi, Configuration, PaginatedEventList, EventSummaryStatusEnum, UpdateEventRequest, CreateEventRequest } from '../generated';
import { isDevelopment } from './constants';

// 認証ヘッダーを取得する関数
const getAuthHeaders = () => {
  if (typeof window !== 'undefined' && isDevelopment) {
    const mockUserData = localStorage.getItem('mockUser');
    if (mockUserData) {
      const mockUser = JSON.parse(mockUserData);
      // 開発環境ではmockユーザー情報をヘッダーに設定（ASCII文字のみ）
      return {
        'X-User-ID': mockUser.user_id,
        'X-User-Roles': mockUser.roles.join(','),
        'X-User-Generation': mockUser.generation.toString(),
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

  // 現在のユーザー情報を取得（開発環境用）
  async getCurrentUserInfo() {
    if (typeof window !== 'undefined' && isDevelopment) {
      const mockUserData = localStorage.getItem('mockUser');
      if (mockUserData) {
        const mockUser = JSON.parse(mockUserData);
        return {
          data: {
            user_id: mockUser.user_id,
            name: mockUser.name,
            roles: mockUser.roles,
            generation: mockUser.generation,
          }
        };
      }
    }
    throw new Error('ユーザーが認証されていません');
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