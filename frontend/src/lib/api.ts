const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// 共通のAPIクライアント
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // イベント一覧取得
  async getEvents(params?: {
    page?: number;
    pageSize?: number;
    statusFilter?: string;
    tagFilter?: string;
  }): Promise<{
    events: Array<{
      id: string;
      title: string;
      finalizedDate?: string;
      status: string;
      organizerName: string;
    }>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.statusFilter) searchParams.append('statusFilter', params.statusFilter);
    if (params?.tagFilter) searchParams.append('tagFilter', params.tagFilter);

    const queryString = searchParams.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // イベント詳細取得
  async getEventDetails(eventId: string): Promise<{
    id: string;
    title: string;
    description: string;
    status: string;
    organizer: {
      userId: string;
      name: string;
      generation: string;
    };
    venue: string;
    allowedRoles: string[];
    tags: string[];
    schedulePoll: {
      pollId: string;
      pollType: string;
      candidateDates: string[];
      responses: Array<{
        userId: string;
        userName: string;
        date: string;
        available: boolean;
      }>;
      finalizedDate?: string;
    };
    feeSettings: Array<{
      applicableRole: string;
      applicableGeneration?: string;
      fee: {
        amount: number;
        currency: string;
      };
    }>;
    registrations: Array<{
      registrationId: string;
      user: {
        userId: string;
        name: string;
        generation: string;
      };
      status: string;
      appliedFee: {
        amount: number;
        currency: string;
      };
      registeredAt: string;
    }>;
  }> {
    return this.request(`/events/${eventId}`);
  }

  // イベント作成
  async createEvent(data: {
    title: string;
    description: string;
    venue: string;
    allowedRoles: string[];
    tags?: string[];
    feeSettings?: Array<{
      applicableRole: string;
      applicableGeneration?: string;
      fee: {
        amount: number;
        currency: string;
      };
    }>;
    pollCandidates: string[];
  }): Promise<{ eventId: string }> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 参加登録
  async registerForEvent(eventId: string): Promise<{ registrationId: string }> {
    return this.request(`/events/${eventId}/register`, {
      method: 'POST',
    });
  }
}

// シングルトンインスタンス
export const api = new ApiClient(API_BASE_URL); 