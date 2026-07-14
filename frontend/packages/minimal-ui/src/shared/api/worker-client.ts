import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './types';

const API_PREFIX = '/api/v1';
const WORKER_JWT_STORAGE_KEY = 'worker_access_token';

class WorkerApiClient {
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
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: 'خطایی رخ داد',
          statusCode: error.response?.status || 500,
        };

        if (error.response?.data) {
          const data = error.response.data as any;
          // Handle both direct message and nested message in data
          if (Array.isArray(data.message)) {
            apiError.message = data.message[0] || apiError.message;
          } else {
            apiError.message = data.message || data.error || apiError.message;
          }
          apiError.error = data.error;
        } else if (error.message) {
          apiError.message = error.message;
        }

        if (error.response?.status === 401) {
          // Don't redirect on login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/worker/login')) {
            this.handleUnauthorized();
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(WORKER_JWT_STORAGE_KEY);
  }

  private handleUnauthorized() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WORKER_JWT_STORAGE_KEY);
      window.location.href = '/worker/login';
    }
  }

  get instance(): AxiosInstance {
    return this.client;
  }
}

export const workerApiClient = new WorkerApiClient().instance;
export const WORKER_TOKEN_KEY = WORKER_JWT_STORAGE_KEY;


