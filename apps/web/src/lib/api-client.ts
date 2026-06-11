const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.post<any>('/auth/login', { email, password });
    if (result.ok && result.data) {
      this.setToken(result.data.token);
    }
    return result;
  }

  async getMe() {
    return this.get<any>('/auth/me');
  }

  // Public
  async createConversation(tenantSlug: string, data: { name?: string; email?: string }) {
    return this.post<any>('/public/conversations', { tenantSlug, ...data });
  }

  async sendMessage(visitorToken: string, conversationId: string, content: string) {
    return this.post<any>(`/public/conversations/${conversationId}/messages`, { content }, {
      'x-visitor-token': visitorToken,
    });
  }

  // Agent
  async getAgentInbox() {
    return this.get<any>('/agent/inbox');
  }

  async claimConversation(conversationId: string) {
    return this.post<any>(`/agent/conversations/${conversationId}/claim`);
  }

  async replyToConversation(conversationId: string, content: string) {
    return this.post<any>(`/agent/conversations/${conversationId}/reply`, { content });
  }

  async closeConversation(conversationId: string) {
    return this.post<any>(`/agent/conversations/${conversationId}/close`);
  }

  async createTicket(conversationId: string, data: { title: string; description?: string; priority?: string }) {
    return this.post<any>(`/agent/conversations/${conversationId}/tickets`, data);
  }

  // Admin
  async uploadDocument(title: string, content: string, sourceType?: string) {
    return this.post<any>('/admin/knowledge/documents', { title, content, sourceType });
  }

  async getDocuments() {
    return this.get<any>('/admin/knowledge/documents');
  }

  async reindexKnowledge() {
    return this.post<any>('/admin/knowledge/reindex');
  }

  async getAnalytics() {
    return this.get<any>('/admin/analytics/overview');
  }

  async getAuditLogs(page?: number, limit?: number) {
    return this.get<any>(`/admin/audit?page=${page || 1}&limit=${limit || 50}`);
  }

  async updateBotConfig(config: { provider?: string; model?: string; handoffThreshold?: number }) {
    return this.post<any>('/admin/bot/config', config);
  }

  async getTeamMembers() {
    return this.get<any>('/admin/team');
  }

  logout() {
    this.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
    }
  }
}

export const apiClient = new ApiClient(API_BASE);
export type { ApiResponse };
