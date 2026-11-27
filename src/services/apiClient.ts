import { ENV } from '../constants/env';
import { ApiError, ApiResponse } from '../types/api';
import { tokenStorage } from '../utils/tokenStorage';

interface RequestOptions extends RequestInit {
  skipAuthRefresh?: boolean;
}

function extractValidationMessage(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  const record = details as Record<string, unknown>;
  const sections = ['body', 'query', 'params'];
  for (const section of sections) {
    const bucket = record[section];
    if (bucket && typeof bucket === 'object') {
      for (const msgs of Object.values(bucket as Record<string, unknown>)) {
        if (Array.isArray(msgs) && typeof msgs[0] === 'string' && msgs[0].trim()) {
          return msgs[0];
        }
      }
    }
  }
  for (const val of Object.values(record)) {
    if (Array.isArray(val) && typeof val[0] === 'string' && val[0].trim()) {
      return val[0];
    }
  }
  return null;
}

const DEFAULT_TIMEOUT_MS = 12000;

class ApiClient {
  private baseUrl: string = ENV.API_BASE_URL;
  private authToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private onSessionExpired: (() => void) | null = null;
  private inflightGets = new Map<string, Promise<ApiResponse<unknown>>>();
  private getCache = new Map<string, { data: ApiResponse<unknown>; expiresAt: number }>();

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token === null) {
      this.getCache.clear();
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setOnSessionExpired(handler: (() => void) | null) {
    this.onSessionExpired = handler;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          return null;
        }

        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          await tokenStorage.clearTokens();
          this.authToken = null;
          this.onSessionExpired?.();
          return null;
        }

        const json = (await response.json()) as ApiResponse<{
          accessToken: string;
          refreshToken: string;
        }>;
        const { accessToken, refreshToken: nextRefreshToken } = json.data;
        this.authToken = accessToken;
        await tokenStorage.saveTokens(accessToken, nextRefreshToken);
        return accessToken;
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { skipAuthRefresh = false, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: fetchOptions.signal ?? controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (response.status === 401 && !skipAuthRefresh && endpoint !== '/auth/refresh') {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          return this.request<T>(endpoint, {
            ...options,
            skipAuthRefresh: true,
          });
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const fieldMsg = extractValidationMessage(errorData.details);
        const error: ApiError = {
          success: false,
          code: errorData.code || `HTTP_${response.status}`,
          message:
            fieldMsg ||
            errorData.message ||
            `Request failed with status ${response.status}`,
          details: errorData.details ?? errorData,
        };
        throw error;
      }

      const payload = (await response.json()) as ApiResponse<T>;
      return payload;
    } catch (err) {
      if ((err as ApiError).code) {
        throw err;
      }
      const genericError: ApiError = {
        success: false,
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'A network error occurred',
      };
      throw genericError;
    }
  }

  get<T>(endpoint: string, headers?: Record<string, string>, cacheTtlMs = 0): Promise<ApiResponse<T>> {
    const cacheKey = `${this.authToken ?? 'anon'}:${endpoint}`;

    if (cacheTtlMs > 0 && !headers) {
      const cached = this.getCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return Promise.resolve(cached.data as ApiResponse<T>);
      }
    }

    if (!headers) {
      const inflight = this.inflightGets.get(cacheKey);
      if (inflight) {
        return inflight as Promise<ApiResponse<T>>;
      }
    }

    const reqPromise = this.request<T>(endpoint, { method: 'GET', headers })
      .then((res) => {
        if (cacheTtlMs > 0 && !headers) {
          this.getCache.set(cacheKey, {
            data: res as ApiResponse<unknown>,
            expiresAt: Date.now() + cacheTtlMs,
          });
        }
        return res;
      })
      .finally(() => {
        this.inflightGets.delete(cacheKey);
      });

    if (!headers) {
      this.inflightGets.set(cacheKey, reqPromise as Promise<ApiResponse<unknown>>);
    }

    return reqPromise;
  }

  post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
