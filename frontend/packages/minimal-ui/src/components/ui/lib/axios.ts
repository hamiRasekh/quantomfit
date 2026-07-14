import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { CONFIG } from '@/ui/global-config';
import { JWT_STORAGE_KEY, TENANT_SLUG_STORAGE_KEY } from '@/ui/auth/context/jwt/constant';

function resolveTenantSlugFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();
  if (!first) return null;

  const reserved = new Set(['admin', 'worker', 'login', 'auth', 'api', 't']);
  if (reserved.has(first)) return null;

  return first;
}

const axiosInstance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem(JWT_STORAGE_KEY) || localStorage.getItem(JWT_STORAGE_KEY);
    const tenantSlugFromStorage =
      sessionStorage.getItem(TENANT_SLUG_STORAGE_KEY) ||
      localStorage.getItem(TENANT_SLUG_STORAGE_KEY);
    const tenantSlug =
      tenantSlugFromStorage || resolveTenantSlugFromPathname(window.location.pathname);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantSlug && config.headers) {
      config.headers['x-tenant-slug'] = tenantSlug;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'خطایی رخ داد!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];
    const res = await axiosInstance.get<T>(url, config);
    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/v1/auth/me',
    signIn: '/api/v1/auth/login',
    signUp: '/api/v1/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
} as const;
