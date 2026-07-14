import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import { User } from '../types';

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId?: string;
}

const BASE_URL = '/users';

export interface UsersListParams {
  page?: number;
  limit?: number;
}

export const usersApi = {
  getAll: async (params?: UsersListParams): Promise<PaginationResponse<User>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<User>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUserPayload): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(BASE_URL, data);
    return response.data.data;
  },
};




