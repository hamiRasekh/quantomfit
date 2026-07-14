import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';
import { UserRole, AssignRoleDto } from '../types';

export const userRolesApi = {
  getByUserId: async (userId: string): Promise<UserRole | null> => {
    try {
      const response = await apiClient.get<ApiResponse<UserRole>>(`/users/${userId}/role`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  assignRole: async (userId: string, data: AssignRoleDto): Promise<UserRole> => {
    const response = await apiClient.post<ApiResponse<UserRole>>(`/users/${userId}/role`, data);
    return response.data.data;
  },

  removeRole: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/role`);
  },
};




