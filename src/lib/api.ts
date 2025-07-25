import { 
  AccountInfo, 
  AccountDetailInfo, 
  AccountInput, 
  ProjectInfo, 
  ProjectInput,
  ChangeInfo,
  ApiResponse,
  ErrorResponse
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class GerritApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = this.authToken;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData: ErrorResponse = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new ApiError(errorMessage, response.status);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as T;
  }

  // Account Management
  async createAccount(username: string, input: AccountInput): Promise<AccountInfo> {
    return this.request<AccountInfo>(`/a/accounts/${username}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  // Registration endpoint that works with backend authentication
  async registerAccount(username: string, email: string, name: string, password: string): Promise<AccountInfo> {
    return this.request<AccountInfo>(`/api/register`, {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        name,
        password
      }),
    });
  }

  async getAccount(accountId: string): Promise<AccountInfo> {
    return this.request<AccountInfo>(`/a/accounts/${accountId}`);
  }

  async getAccountDetail(accountId: string): Promise<AccountDetailInfo> {
    return this.request<AccountDetailInfo>(`/a/accounts/${accountId}/detail`);
  }

  async updateAccount(accountId: string, input: AccountInput): Promise<AccountInfo> {
    return this.request<AccountInfo>(`/a/accounts/${accountId}`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async queryAccounts(params?: {
    q?: string;
    active?: boolean;
    n?: number;
    S?: number;
  }): Promise<Record<string, AccountInfo>> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());
    if (params?.n) searchParams.append('n', params.n.toString());
    if (params?.S) searchParams.append('S', params.S.toString());

    const queryString = searchParams.toString();
    const endpoint = `/a/accounts/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Record<string, AccountInfo>>(endpoint);
  }

  // Project Management
  async createProject(projectName: string, input: ProjectInput): Promise<ProjectInfo> {
    return this.request<ProjectInfo>(`/a/projects/${projectName}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async getProject(projectName: string): Promise<ProjectInfo> {
    return this.request<ProjectInfo>(`/a/projects/${projectName}`);
  }

  async queryProjects(params?: {
    query?: string;
    limit?: number;
    start?: number;
    type?: string;
    description?: boolean;
    tree?: boolean;
    branches?: string[];
    all?: boolean;
  }): Promise<Record<string, ProjectInfo>> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.start) searchParams.append('start', params.start.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.description !== undefined) searchParams.append('description', params.description.toString());
    if (params?.tree !== undefined) searchParams.append('tree', params.tree.toString());
    if (params?.branches) {
      params.branches.forEach(branch => searchParams.append('branches', branch));
    }
    if (params?.all !== undefined) searchParams.append('all', params.all.toString());

    const queryString = searchParams.toString();
    const endpoint = `/a/projects/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Record<string, ProjectInfo>>(endpoint);
  }

  async deleteProject(projectName: string, force?: boolean): Promise<void> {
    const searchParams = new URLSearchParams();
    if (force) searchParams.append('force', 'true');

    const queryString = searchParams.toString();
    const endpoint = `/a/projects/${projectName}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Change Management
  async queryChanges(params?: {
    q?: string;
    n?: number;
    S?: number;
    o?: string[];
  }): Promise<ChangeInfo[]> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.n) searchParams.append('n', params.n.toString());
    if (params?.S) searchParams.append('S', params.S.toString());
    if (params?.o) {
      params.o.forEach(option => searchParams.append('o', option));
    }

    const queryString = searchParams.toString();
    const endpoint = `/a/changes${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ChangeInfo[]>(endpoint);
  }

  async getChange(changeId: string, options?: string[]): Promise<ChangeInfo> {
    const searchParams = new URLSearchParams();
    if (options) {
      options.forEach(option => searchParams.append('o', option));
    }

    const queryString = searchParams.toString();
    const endpoint = `/a/changes/${changeId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ChangeInfo>(endpoint);
  }

  // Authentication using the backend login endpoint
  async authenticate(username: string, password: string): Promise<{ token: string }> {
    const response = await this.request<{ token: string; user: AccountInfo }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password
      }),
    });
    
    this.authToken = response.token;
    return { token: response.token };
  }

  logout() {
    this.authToken = undefined;
  }
}

// Create a singleton instance
export const gerritApi = new GerritApiClient();

// Export the class for testing
export { GerritApiClient, ApiError };
