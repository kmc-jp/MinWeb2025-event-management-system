import { DefaultApi, Configuration, PaginatedEventList, EventSummaryStatusEnum, UpdateEventRequest, CreateEventRequest } from '../generated';
import { isDevelopment } from './constants';

// Mockユーザーの型定義
interface MockUser {
  user_id: string;
  name: string;
  roles: string[];
  generation: number;
}

// APIクライアントの設定
const configuration = new Configuration({
  basePath: typeof window !== 'undefined' 
    ? window.location.origin.replace('3000', '8080') 
    : 'http://localhost:8080',
});

// APIクライアントのインスタンスを作成
export const apiClient = new DefaultApi(configuration);

// Mockユーザー用のAPIクライアント
class MockApiClient {
  private mockUser: MockUser | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const mockUserData = localStorage.getItem('mockUser');
      if (mockUserData) {
        this.mockUser = JSON.parse(mockUserData);
      } else {
        // デフォルトのモックユーザーを設定
        this.mockUser = {
          user_id: 'dummy-user-001',
          name: 'テストユーザー',
          roles: ['member'], // デフォルトでmember役割
          generation: 1
        };
        localStorage.setItem('mockUser', JSON.stringify(this.mockUser));
      }
    }
  }

  // 現在のユーザー情報を取得（Mock）
  async getCurrentUser() {
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    return {
      data: {
        user_id: this.mockUser.user_id,
        name: this.mockUser.name,
        roles: this.mockUser.roles,
        generation: this.mockUser.generation,
      }
    };
  }

  // 役割一覧を取得（Mock）
  async listRoles() {
    return {
      data: [
        {
          name: 'admin',
          description: 'システム管理者',
          created_at: '2023-01-01T00:00:00Z',
          created_by: 'system'
        },
        {
          name: 'member',
          description: '一般部員',
          created_at: '2023-01-01T00:00:00Z',
          created_by: 'system'
        }
      ]
    };
  }

  // 役割詳細を取得（Mock）
  async getRoleDetails(roleName: string) {
    const mockUsers = [
      { user_id: 'admin1', name: 'Admin User', generation: '2023' },
      { user_id: 'member1', name: 'Member User 1', generation: '2023' },
      { user_id: 'member2', name: 'Member User 2', generation: '2024' }
    ];

    return {
      data: {
        name: roleName,
        description: roleName === 'admin' ? 'システム管理者' : '一般部員',
        created_at: '2023-01-01T00:00:00Z',
        created_by: 'system',
        users: roleName === 'admin' ? [mockUsers[0]] : mockUsers.slice(1)
      }
    };
  }

  // 役割を更新（Mock）
  async updateRole(roleName: string, roleData: { description: string }) {
    return {
      data: {
        name: roleName,
        description: roleData.description,
        created_at: '2023-01-01T00:00:00Z',
        created_by: 'system'
      }
    };
  }

  // タグ一覧を取得（Mock）
  async listTags() {
    return {
      data: [
        { name: '技術勉強会', created_at: '2023-01-01T00:00:00Z', created_by: 'system' },
        { name: '懇親会', created_at: '2023-01-01T00:00:00Z', created_by: 'system' },
        { name: 'ハッカソン', created_at: '2023-01-01T00:00:00Z', created_by: 'system' },
        { name: 'LT会', created_at: '2023-01-01T00:00:00Z', created_by: 'system' },
        { name: 'ワークショップ', created_at: '2023-01-01T00:00:00Z', created_by: 'system' }
      ]
    };
  }

  // 新しいタグを作成（Mock）
  async createTag(tagData: { name: string }) {
    return {
      data: {
        name: tagData.name,
        created_at: '2023-01-01T00:00:00Z',
        created_by: 'system'
      }
    };
  }

  // 新しい役割を作成（Mock）
  async createRole(roleData: { name: string; description: string }) {
    return {
      data: {
        name: roleData.name,
        description: roleData.description,
        created_at: new Date().toISOString(),
        created_by: this.mockUser?.user_id || 'unknown'
      }
    };
  }

  // 役割を削除（Mock）
  async deleteRole(roleName: string) {
    // Mock実装では何もしない
    return { data: undefined };
  }

  // ユーザーに役割を付与（Mock）
  async assignRoleToUser(userId: string, roleName: string) {
    // Mock実装では現在のユーザー情報を返す
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    return {
      data: {
        user_id: this.mockUser.user_id,
        name: this.mockUser.name,
        roles: [...this.mockUser.roles, roleName],
        generation: this.mockUser.generation,
      }
    };
  }

  // ユーザーから役割を削除（Mock）
  async removeRoleFromUser(userId: string, roleName: string) {
    // Mock実装では現在のユーザー情報を返す
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    return {
      data: {
        user_id: this.mockUser.user_id,
        name: this.mockUser.name,
        roles: this.mockUser.roles.filter((role: string) => role !== roleName),
        generation: this.mockUser.generation,
      }
    };
  }

  // ユーザー一覧を取得（Mock）
  async listUsers(role?: string, generation?: string) {
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    const mockUsers = [
      { user_id: 'user1', name: '田中太郎', generation: '2023' },
      { user_id: 'user2', name: '佐藤花子', generation: '2023' },
      { user_id: 'user3', name: '鈴木一郎', generation: '2024' },
      { user_id: 'user4', name: '高橋美咲', generation: '2024' },
      { user_id: 'admin1', name: '管理者', generation: '2023' },
    ];

    let filteredUsers = mockUsers;

    // 役割フィルタ
    if (role) {
      if (role === 'admin') {
        filteredUsers = filteredUsers.filter(user => user.user_id === 'admin1');
      } else if (role === 'member') {
        filteredUsers = filteredUsers.filter(user => user.user_id !== 'admin1');
      }
    }

    // 世代フィルタ
    if (generation) {
      filteredUsers = filteredUsers.filter(user => user.generation === generation);
    }

    return {
      data: filteredUsers
    };
  }

  // ユーザー情報を取得（Mock）
  async getUser(id: string) {
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    // 現在のユーザーのIDと一致する場合のみ返す
    if (id === this.mockUser.user_id) {
      return {
        data: {
          user_id: this.mockUser.user_id,
          name: this.mockUser.name,
          roles: this.mockUser.roles,
          generation: this.mockUser.generation,
        }
      };
    }

    throw new Error('ユーザーが見つかりません');
  }

  // イベント作成（Mock）
  async createEvent(createEventRequest: CreateEventRequest) {
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    // 運営のみがイベントを作成可能
    if (!this.mockUser.roles.includes('admin')) {
      throw new Error('イベントの作成権限がありません');
    }

    return {
      data: {
        event_id: `mock-event-${Date.now()}`,
        title: createEventRequest.title,
        description: createEventRequest.description,
        venue: createEventRequest.venue,
        allowed_roles: createEventRequest.allowed_roles,
        tags: createEventRequest.tags,
        fee_settings: createEventRequest.fee_settings,
        poll_type: createEventRequest.poll_type,
        poll_candidates: createEventRequest.poll_candidates,
        status: 'DRAFT',
        organizer_name: this.mockUser.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
  }

  // イベント詳細を取得（Mock）
  async getEventDetails(id: string) {
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    // Mockイベントデータ
    const mockEvent = {
      event_id: id,
      title: 'Mock Event',
      description: 'This is a mock event for development',
      venue: 'Mock Venue',
      allowed_roles: ['member'], // member役割のユーザーのみ参加可能
      editable_roles: ['admin'],
      tags: ['mock', 'development'],
      fee_settings: [],
      poll_type: 'date_select',
      poll_candidates: [],
      status: 'DRAFT' as EventSummaryStatusEnum,
      organizer_name: 'Mock Organizer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      data: mockEvent
    };
  }

  // イベントを更新（Mock）
  async updateEvent(id: string, updateEventRequest: UpdateEventRequest) {
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    return {
      data: {
        event_id: id,
        title: updateEventRequest.title,
        description: updateEventRequest.description,
        venue: updateEventRequest.venue,
        allowed_roles: updateEventRequest.allowed_roles,
        editable_roles: updateEventRequest.editable_roles,
        tags: updateEventRequest.tags,
        fee_settings: updateEventRequest.fee_settings,
        status: 'DRAFT' as EventSummaryStatusEnum,
        organizer_name: 'Mock Organizer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
  }

  // イベントを削除（Mock）
  async deleteEvent(id: string) {
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    // Mock実装では何もしない
    return { data: undefined };
  }

  // イベント一覧を取得（Mock）
  async listEvents(page?: number, pageSize?: number, status?: string, tags?: string) {
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    const mockEvents = [
      {
        event_id: 'mock-event-1',
        title: 'Mock Event 1',
        status: 'DRAFT' as EventSummaryStatusEnum,
        organizer_name: 'Mock Organizer 1',
        tags: ['ワークショップ', '技術勉強会'],
        allowed_roles: ['member'], // member役割のユーザーのみ参加可能
        confirmed_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1週間後
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-2',
        title: 'Mock Event 2',
        status: 'CONFIRMED' as EventSummaryStatusEnum,
        organizer_name: 'Mock Organizer 2',
        tags: ['懇親会', 'LT会'],
        allowed_roles: ['member'], // member役割のユーザーのみ参加可能
        confirmed_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2週間後
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-3',
        title: 'Mock Event 3',
        status: 'SCHEDULE_POLLING' as EventSummaryStatusEnum,
        organizer_name: 'Mock Organizer 3',
        tags: ['ハッカソン', 'ワークショップ'],
        allowed_roles: ['member'], // member役割のユーザーのみ参加可能
        confirmed_date: null,
        schedule_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10日後
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // フィルタリング
    let filteredEvents = mockEvents;

    // ステータスフィルタ
    if (status) {
      filteredEvents = filteredEvents.filter(event => event.status === status);
    }

    // タグフィルタ
    if (tags) {
      const selectedTags = tags.split(',').map(tag => tag.trim());
      filteredEvents = filteredEvents.filter(event => {
        if (!event.tags) return false;
        return selectedTags.some(selectedTag => 
          event.tags!.some(eventTag => eventTag === selectedTag)
        );
      });
    }

    return {
      data: {
        data: filteredEvents,
        total_count: filteredEvents.length,
        page: page || 1,
        page_size: pageSize || 10,
      }
    };
  }

  // ヘルスチェック（Mock）
  async healthCheck() {
    return {
      data: {
        status: 'ok'
      }
    };
  }

  // イベント参加者一覧を取得（Mock）
  async listEventParticipants(id: string) {
    const mockParticipants = [
      {
        user_id: 'user1',
        name: '田中太郎',
        generation: 1,
        joined_at: '2024-02-01T10:00:00Z',
        status: 'CONFIRMED'
      },
      {
        user_id: 'user2',
        name: '佐藤花子',
        generation: 2,
        joined_at: '2024-02-02T11:00:00Z',
        status: 'PENDING'
      }
    ];

    return {
      data: mockParticipants
    };
  }

  // イベントに参加（Mock）
  async joinEvent(id: string, joinEventRequest: { user_id: string }) {
    const mockParticipant = {
      user_id: joinEventRequest.user_id,
      name: '参加者',
      generation: 1,
      joined_at: new Date().toISOString(),
      status: 'PENDING'
    };

    return {
      data: mockParticipant
    };
  }

  // イベントから退出（Mock）
  async leaveEvent(id: string, userId: string) {
    // Mock実装では何もしない
    return { data: undefined };
  }
}

// 環境に応じてAPIクライアントを選択
export const getApiClient = () => {
  if (isDevelopment) {
    return new MockApiClient();
  }
  return apiClient;
};

// エラーハンドリング用のヘルパー関数
export const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { response?: { data?: { error?: string } }; message?: string };
    if (errorObj.response?.data?.error) {
      return errorObj.response.data.error;
    }
    if (errorObj.message) {
      return errorObj.message;
    }
  }
  return '予期しないエラーが発生しました';
}; 