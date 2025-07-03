import { DefaultApi, Configuration, PaginatedEventList, EventSummaryStatusEnum, UserRole } from '../generated';

// 開発環境かどうかをチェック
const isDevelopment = process.env.NODE_ENV === 'development';

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
  private mockUser: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const mockUserData = localStorage.getItem('mockUser');
      if (mockUserData) {
        this.mockUser = JSON.parse(mockUserData);
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
        role: this.mockUser.role,
        generation: this.mockUser.generation,
      }
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
          role: this.mockUser.role,
          generation: this.mockUser.generation,
        }
      };
    }

    throw new Error('ユーザーが見つかりません');
  }

  // イベント作成（Mock）
  async createEvent(createEventRequest: any) {
    if (!this.mockUser) {
      throw new Error('ユーザーが認証されていません');
    }

    // 運営のみがイベントを作成可能
    if (this.mockUser.role !== 'CircleAdmin') {
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
      allowed_roles: ['CircleAdmin', 'RegularMember', 'Alumni', 'External'] as UserRole[],
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        event_id: 'mock-event-2',
        title: 'Mock Event 2',
        status: 'CONFIRMED' as EventSummaryStatusEnum,
        organizer_name: 'Mock Organizer 2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return {
      data: {
        data: mockEvents,
        total_count: mockEvents.length,
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
}

// 環境に応じてAPIクライアントを選択
export const getApiClient = () => {
  if (isDevelopment) {
    return new MockApiClient();
  }
  return apiClient;
};

// エラーハンドリング用のヘルパー関数
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return '予期しないエラーが発生しました';
}; 