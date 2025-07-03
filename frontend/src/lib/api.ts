import { DefaultApi, Configuration, PaginatedEventList, EventSummaryStatusEnum, UpdateEventRequest, CreateEventRequest } from '../generated';
import { isDevelopment } from './constants';

// Mockユーザーの型定義
interface MockUser {
  user_id: string;
  name: string;
  roles: string[];
  generation: number;
}

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
        title: '技術勉強会：React入門',
        status: 'DRAFT' as EventSummaryStatusEnum,
        organizer_name: '田中 健太',
        tags: ['ワークショップ', '技術勉強会', 'React'],
        allowed_roles: ['member'],
        confirmed_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-2',
        title: '懇親会：新入生歓迎',
        status: 'CONFIRMED' as EventSummaryStatusEnum,
        organizer_name: '佐藤 由美',
        tags: ['懇親会', '新入生'],
        allowed_roles: ['member', 'admin'],
        confirmed_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-3',
        title: 'LT会：技術発表',
        status: 'SCHEDULE_POLLING' as EventSummaryStatusEnum,
        organizer_name: '鈴木 太郎',
        tags: ['LT会', '技術発表'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-4',
        title: 'ハッカソン：AIチャレンジ',
        status: 'CONFIRMED' as EventSummaryStatusEnum,
        organizer_name: '高橋 花子',
        tags: ['ハッカソン', 'AI', 'プログラミング'],
        allowed_roles: ['member'],
        confirmed_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-5',
        title: '読書会：技術書レビュー',
        status: 'DRAFT' as EventSummaryStatusEnum,
        organizer_name: '伊藤 次郎',
        tags: ['読書会', '技術書'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-6',
        title: 'ゲーム開発ワークショップ',
        status: 'SCHEDULE_POLLING' as EventSummaryStatusEnum,
        organizer_name: '渡辺 美咲',
        tags: ['ワークショップ', 'ゲーム開発', 'Unity'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-7',
        title: '卒業生送別会',
        status: 'CONFIRMED' as EventSummaryStatusEnum,
        organizer_name: '山田 健太',
        tags: ['送別会', '卒業生'],
        allowed_roles: ['member', 'admin'],
        confirmed_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-8',
        title: 'デザインワークショップ',
        status: 'DRAFT' as EventSummaryStatusEnum,
        organizer_name: '中村 愛子',
        tags: ['ワークショップ', 'デザイン', 'Figma'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-9',
        title: 'バックエンド勉強会',
        status: 'CONFIRMED' as EventSummaryStatusEnum,
        organizer_name: '小林 大輔',
        tags: ['勉強会', 'バックエンド', 'Go'],
        allowed_roles: ['member'],
        confirmed_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-10',
        title: 'フロントエンド勉強会',
        status: 'SCHEDULE_POLLING' as EventSummaryStatusEnum,
        organizer_name: '加藤 恵子',
        tags: ['勉強会', 'フロントエンド', 'TypeScript'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-11',
        title: 'データサイエンス勉強会',
        status: 'DRAFT' as EventSummaryStatusEnum,
        organizer_name: '田中 健太',
        tags: ['勉強会', 'データサイエンス', 'Python'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-12',
        title: 'セキュリティ勉強会',
        status: 'CONFIRMED' as EventSummaryStatusEnum,
        organizer_name: '佐藤 由美',
        tags: ['勉強会', 'セキュリティ'],
        allowed_roles: ['member', 'admin'],
        confirmed_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-13',
        title: 'モバイルアプリ開発ワークショップ',
        status: 'SCHEDULE_POLLING' as EventSummaryStatusEnum,
        organizer_name: '鈴木 太郎',
        tags: ['ワークショップ', 'モバイル', 'Flutter'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-14',
        title: 'オープンソース貢献勉強会',
        status: 'DRAFT' as EventSummaryStatusEnum,
        organizer_name: '高橋 花子',
        tags: ['勉強会', 'オープンソース', 'GitHub'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-15',
        title: 'クラウドインフラ勉強会',
        status: 'CONFIRMED' as EventSummaryStatusEnum,
        organizer_name: '伊藤 次郎',
        tags: ['勉強会', 'クラウド', 'AWS'],
        allowed_roles: ['member'],
        confirmed_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-16',
        title: '機械学習ワークショップ',
        status: 'SCHEDULE_POLLING' as EventSummaryStatusEnum,
        organizer_name: '渡辺 美咲',
        tags: ['ワークショップ', '機械学習', 'TensorFlow'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-17',
        title: 'ブロックチェーン勉強会',
        status: 'DRAFT' as EventSummaryStatusEnum,
        organizer_name: '山田 健太',
        tags: ['勉強会', 'ブロックチェーン', 'Ethereum'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-18',
        title: 'DevOps勉強会',
        status: 'CONFIRMED' as EventSummaryStatusEnum,
        organizer_name: '中村 愛子',
        tags: ['勉強会', 'DevOps', 'Docker'],
        allowed_roles: ['member', 'admin'],
        confirmed_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        schedule_deadline: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-19',
        title: 'UI/UXデザイン勉強会',
        status: 'SCHEDULE_POLLING' as EventSummaryStatusEnum,
        organizer_name: '小林 大輔',
        tags: ['勉強会', 'UI/UX', 'デザイン'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-20',
        title: 'プロジェクト管理勉強会',
        status: 'DRAFT' as EventSummaryStatusEnum,
        organizer_name: '加藤 恵子',
        tags: ['勉強会', 'プロジェクト管理', 'アジャイル'],
        allowed_roles: ['member'],
        confirmed_date: null,
        schedule_deadline: null,
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
        user_id: 'member1',
        name: '鈴木 太郎',
        generation: 45,
        joined_at: '2024-02-01T10:00:00Z',
        status: 'CONFIRMED'
      },
      {
        user_id: 'member2',
        name: '高橋 花子',
        generation: 46,
        joined_at: '2024-02-02T11:00:00Z',
        status: 'PENDING'
      },
      {
        user_id: 'member3',
        name: '伊藤 次郎',
        generation: 47,
        joined_at: '2024-02-03T14:30:00Z',
        status: 'CONFIRMED'
      },
      {
        user_id: 'member4',
        name: '渡辺 美咲',
        generation: 48,
        joined_at: '2024-02-04T09:15:00Z',
        status: 'PENDING'
      },
      {
        user_id: 'admin1',
        name: '田中 健太',
        generation: 45,
        joined_at: '2024-02-01T08:00:00Z',
        status: 'CONFIRMED'
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

// APIクライアントをラップして認証ヘッダーを追加
const createAuthenticatedApiClient = () => {
  const authHeaders = getAuthHeaders();
  
  return {
    // イベント関連
    listEvents: async (page?: number, pageSize?: number, status?: 'DRAFT' | 'SCHEDULE_POLLING' | 'CONFIRMED' | 'FINISHED' | 'CANCELLED', tags?: string) => {
      return apiClient.listEvents(page, pageSize, status, tags, { headers: authHeaders });
    },
    getEventDetails: async (id: string) => {
      return apiClient.getEventDetails(id, { headers: authHeaders });
    },
    createEvent: async (createEventRequest: CreateEventRequest) => {
      return apiClient.createEvent(createEventRequest, { headers: authHeaders });
    },
    updateEvent: async (id: string, updateEventRequest: UpdateEventRequest) => {
      return apiClient.updateEvent(id, updateEventRequest, { headers: authHeaders });
    },
    deleteEvent: async (id: string) => {
      return apiClient.deleteEvent(id, { headers: authHeaders });
    },
    joinEvent: async (id: string, joinEventRequest: { user_id: string }) => {
      return apiClient.joinEvent(id, joinEventRequest, { headers: authHeaders });
    },
    leaveEvent: async (id: string, userId: string) => {
      return apiClient.leaveEvent(id, userId, { headers: authHeaders });
    },
    listEventParticipants: async (id: string) => {
      return apiClient.listEventParticipants(id, { headers: authHeaders });
    },
    
    // ユーザー関連
    getCurrentUser: async () => {
      return apiClient.getCurrentUser({ headers: authHeaders });
    },
    listUsers: async (role?: string, generation?: string) => {
      return apiClient.listUsers(role, generation, { headers: authHeaders });
    },
    getUser: async (id: string) => {
      return apiClient.getUser(id, { headers: authHeaders });
    },
    
    // 役割関連
    listRoles: async () => {
      return apiClient.listRoles({ headers: authHeaders });
    },
    getRoleDetails: async (roleName: string) => {
      return apiClient.getRoleDetails(roleName, { headers: authHeaders });
    },
    createRole: async (roleData: { name: string; description: string }) => {
      return apiClient.createRole(roleData, { headers: authHeaders });
    },
    updateRole: async (roleName: string, roleData: { description: string }) => {
      return apiClient.updateRole(roleName, roleData, { headers: authHeaders });
    },
    deleteRole: async (roleName: string) => {
      return apiClient.deleteRole(roleName, { headers: authHeaders });
    },
    assignRoleToUser: async (userId: string, roleName: string) => {
      return apiClient.assignRoleToUser(userId, { role_name: roleName }, { headers: authHeaders });
    },
    removeRoleFromUser: async (userId: string, roleName: string) => {
      return apiClient.removeRoleFromUser(userId, roleName, { headers: authHeaders });
    },
    
    // タグ関連
    listTags: async () => {
      return apiClient.listTags({ headers: authHeaders });
    },
    createTag: async (tagData: { name: string }) => {
      return apiClient.createTag(tagData, { headers: authHeaders });
    },
    
    // その他
    healthCheck: async () => {
      return apiClient.healthCheck({ headers: authHeaders });
    },
  };
};

// 環境に応じてAPIクライアントを選択
export const getApiClient = () => {
  // 開発環境でも本番環境でも同じAPIクライアントを使用
  // 認証のみmockを使用し、データはMySQLから取得
  return createAuthenticatedApiClient();
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