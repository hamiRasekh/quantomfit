import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { ApiError } from './types';
import { getApiErrorMessage } from './parse-api-error';
import { JWT_STORAGE_KEY, TENANT_SLUG_STORAGE_KEY } from '@/ui/auth/context/jwt/constant';

const API_PREFIX = '/api/v1';

function resolveTenantSlugFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();
  if (!first) return null;

  const reserved = new Set(['admin', 'worker', 'login', 'auth', 'api', 't']);
  if (reserved.has(first)) return null;

  return first;
}

function shouldShowGlobalErrorToast(statusCode: number): boolean {
  if (statusCode === 401) return false;
  return statusCode >= 400;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      // Use relative baseURL to avoid LAN/localhost issues and eliminate CORS (via Next.js rewrite)
      baseURL: API_PREFIX,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        const tenantSlug = this.getTenantSlug();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (tenantSlug && config.headers) {
          config.headers['x-tenant-slug'] = tenantSlug;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        const statusCode = error.response?.status || 500;
        const message = getApiErrorMessage(error, 'خطایی رخ داد');

        const apiError: ApiError = {
          message,
          statusCode,
        };

        if (error.response?.data && typeof error.response.data === 'object') {
          const data = error.response.data as Record<string, unknown>;
          if (typeof data.error === 'string') {
            apiError.error = data.error;
          }
        }

        if (statusCode === 401) {
          this.handleUnauthorized();
        } else if (
          shouldShowGlobalErrorToast(statusCode) &&
          !error.config?.skipGlobalErrorToast &&
          typeof window !== 'undefined'
        ) {
          toast.error(message);
          apiError.globalToastShown = true;
        }

        return Promise.reject(apiError);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(JWT_STORAGE_KEY);
  }

  private getTenantSlug(): string | null {
    if (typeof window === 'undefined') return null;
    const fromStorage = (
      sessionStorage.getItem(TENANT_SLUG_STORAGE_KEY) ||
      localStorage.getItem(TENANT_SLUG_STORAGE_KEY)
    );
    return fromStorage || resolveTenantSlugFromPathname(window.location.pathname);
  }

  private handleUnauthorized() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      window.location.href = '/login';
    }
  }

  get instance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;
