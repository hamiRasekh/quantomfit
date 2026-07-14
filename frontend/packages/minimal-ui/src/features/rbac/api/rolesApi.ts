import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';
import {
  Role,
  Permission,
  CreateRoleDto,
  UpdateRoleDto,
  UpdateRolePermissionsDto,
} from '../types';

const BASE_URL = '/roles';

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>(BASE_URL);
    return response.data.data;
  },

  getById: async (id: string): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateRoleDto): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    const response = await apiClient.patch<ApiResponse<Role>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  getPermissions: async (id: string): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>(`${BASE_URL}/${id}/permissions`);
    return response.data.data;
  },

  updatePermissions: async (id: string, data: UpdateRolePermissionsDto): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>(`${BASE_URL}/${id}/permissions`, data);
    return response.data.data;
  },
};

export const permissionsApi = {
  getAll: async (): Promise<Permission[]> => {
    const response = await apiClient.get<ApiResponse<Permission[]>>('/permissions');
    return response.data.data;
  },
};




