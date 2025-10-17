import {
  API_CONFIG,
  ApiResponse,
  PaginatedResponse,
  Transaction,
  Stats,
  UserStats,
  TransactionFilters,
  TransactionSortBy,
  SortOrder,
  ApiError,
  NetworkError,
  TimeoutError,
} from './types';

/**
 * HTTP API Client
 * Handles all REST API communication with retry logic
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.retries = API_CONFIG.retries;
    this.retryDelay = API_CONFIG.retryDelay;
  }

  /**
   * Make HTTP request with timeout and retry
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 0
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.timeout
    );

    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error
        );
      }

      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        throw new ApiError(data.error || 'API request failed');
      }

      return data.data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle AbortController timeout
      if (error.name === 'AbortError') {
        if (attempt < this.retries) {
          await this.sleep(this.retryDelay * (attempt + 1));
          return this.request<T>(endpoint, options, attempt + 1);
        }
        throw new TimeoutError();
      }

      // Handle network errors
      if (error instanceof TypeError) {
        if (attempt < this.retries) {
          await this.sleep(this.retryDelay * (attempt + 1));
          return this.request<T>(endpoint, options, attempt + 1);
        }
        throw new NetworkError();
      }

      // Handle API errors
      if (error instanceof ApiError) {
        // Retry on 5xx errors
        if (
          error.statusCode &&
          error.statusCode >= 500 &&
          attempt < this.retries
        ) {
          await this.sleep(this.retryDelay * (attempt + 1));
          return this.request<T>(endpoint, options, attempt + 1);
        }
      }

      throw error;
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build query string from object
   */
  private buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, String(v)));
        } else {
          query.append(key, String(value));
        }
      }
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * GET request
   */
  private async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    const query = params ? this.buildQueryString(params) : '';
    return this.request<T>(`${endpoint}${query}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  private async post<T>(
    endpoint: string,
    body?: any
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Get all transactions with filters
   */
  async getTransactions(
    filters?: TransactionFilters,
    sortBy?: TransactionSortBy,
    sortOrder?: SortOrder,
    page: number = 1,
    pageSize: number = API_CONFIG.defaultPageSize
  ): Promise<PaginatedResponse<Transaction>> {
    return this.get<PaginatedResponse<Transaction>>(
      API_CONFIG.endpoints.transactions,
      {
        ...filters,
        sortBy,
        sortOrder,
        page,
        pageSize,
      }
    );
  }

  /**
   * Get single transaction by ID
   */
  async getTransaction(id: string): Promise<Transaction> {
    return this.get<Transaction>(
      `${API_CONFIG.endpoints.transactions}/${id}`
    );
  }

  /**
   * Get global statistics
   */
  async getStats(): Promise<Stats> {
    return this.get<Stats>(API_CONFIG.endpoints.stats);
  }

  /**
   * Get user statistics
   */
  async getUserStats(address: string): Promise<UserStats> {
    return this.get<UserStats>(
      `${API_CONFIG.endpoints.userStats}?address=${address}`
    );
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(
    address: string,
    filters?: TransactionFilters,
    page: number = 1,
    pageSize: number = API_CONFIG.defaultPageSize
  ): Promise<PaginatedResponse<Transaction>> {
    return this.get<PaginatedResponse<Transaction>>(
      API_CONFIG.endpoints.userTransactions,
      {
        address,
        ...filters,
        page,
        pageSize,
      }
    );
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    return this.get<{ status: string; timestamp: number }>(
      API_CONFIG.endpoints.health
    );
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    // Store token for authenticated requests
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('api_auth_token', token);
    }
  }

  /**
   * Clear authorization token
   */
  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('api_auth_token');
    }
  }

  /**
   * Get authorization token
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('api_auth_token');
    }
    return null;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Export convenience functions
export const {
  getTransactions,
  getTransaction,
  getStats,
  getUserStats,
  getUserTransactions,
  healthCheck,
} = apiClient;
