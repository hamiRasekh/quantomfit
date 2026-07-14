import axios from 'axios';
import { ApiResponse } from '@/shared/api/types';
import {
  AdminTenantCompany,
  AdminTenantCompanyDetails,
  CreateTenantCompanyDto,
  MasterPermission,
  MasterRole,
  MasterUser,
  UpdateTenantCompanyAdminCredentialsDto,
} from '../types';

const API_PREFIX = '/api/v1';
export const ADMIN_JWT_STORAGE_KEY = 'admin_jwt_token';
const ADMIN_JWT_STORAGE_FALLBACK_KEY = 'admin_jwt_token_fallback';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem(ADMIN_JWT_STORAGE_KEY) ||
    localStorage.getItem(ADMIN_JWT_STORAGE_FALLBACK_KEY)
  );
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_JWT_STORAGE_KEY, token);
  localStorage.setItem(ADMIN_JWT_STORAGE_FALLBACK_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_JWT_STORAGE_KEY);
  localStorage.removeItem(ADMIN_JWT_STORAGE_FALLBACK_KEY);
}

const adminClient = axios.create({
  baseURL: API_PREFIX,
  headers: { 'Content-Type': 'application/json' },
});

adminClient.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  login: async (email: string, password: string): Promise<{ accessToken: string; expiresIn: string }> => {
    const response = await adminClient.post<ApiResponse<{ accessToken: string; expiresIn: string }>>('/saas/admin/login', {
      email,
      password,
    });
    return response.data.data;
  },

  listCompanies: async (): Promise<AdminTenantCompany[]> => {
    const response = await adminClient.get<ApiResponse<AdminTenantCompany[]>>('/saas/companies');
    return response.data.data;
  },

  getCompanyDetails: async (companyId: string): Promise<AdminTenantCompanyDetails> => {
    const response = await adminClient.get<ApiResponse<AdminTenantCompanyDetails>>(`/saas/companies/${companyId}`);
    return response.data.data;
  },

  createCompany: async (data: CreateTenantCompanyDto): Promise<{ companyId: string; tenantDb: string }> => {
    const response = await adminClient.post<ApiResponse<{ companyId: string; tenantDb: string }>>('/saas/companies', data);
    return response.data.data;
  },

  updateCompanyAdminCredentials: async (
    companyId: string,
    data: UpdateTenantCompanyAdminCredentialsDto
  ): Promise<AdminTenantCompanyDetails> => {
    const response = await adminClient.patch<ApiResponse<AdminTenantCompanyDetails>>(
      `/saas/companies/${companyId}/admin-credentials`,
      data
    );
    return response.data.data;
  },

  getProfile: async (): Promise<MasterUser> => {
    const response = await adminClient.get<ApiResponse<MasterUser>>('/saas/admin/profile');
    return response.data.data;
  },

  updateProfile: async (data: { email?: string; currentPassword?: string; newPassword?: string }): Promise<MasterUser> => {
    const response = await adminClient.patch<ApiResponse<MasterUser>>('/saas/admin/profile', data);
    return response.data.data;
  },

  listUsers: async (): Promise<MasterUser[]> => {
    const response = await adminClient.get<ApiResponse<MasterUser[]>>('/saas/admin/users');
    return response.data.data;
  },

  createUser: async (data: { email: string; password: string; roleCodes?: string[] }): Promise<{ id: string; email: string }> => {
    const response = await adminClient.post<ApiResponse<{ id: string; email: string }>>('/saas/admin/users', data);
    return response.data.data;
  },

  listRoles: async (): Promise<MasterRole[]> => {
    const response = await adminClient.get<ApiResponse<MasterRole[]>>('/saas/admin/roles');
    return response.data.data;
  },

  createRole: async (data: { name: string; code: string; permissionCodes: string[] }): Promise<{ id: string; name: string; code: string }> => {
    const response = await adminClient.post<ApiResponse<{ id: string; name: string; code: string }>>('/saas/admin/roles', data);
    return response.data.data;
  },

  listPermissions: async (): Promise<MasterPermission[]> => {
    const response = await adminClient.get<ApiResponse<MasterPermission[]>>('/saas/admin/permissions');
    return response.data.data;
  },
};
