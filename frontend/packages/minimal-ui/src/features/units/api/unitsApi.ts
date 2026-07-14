import { apiClient } from '@/shared/api/client';
import { Unit, CreateUnitDto, UpdateUnitDto, UnitListParams } from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/units';

export const unitsApi = {
  getAll: async (params?: UnitListParams): Promise<PaginationResponse<Unit>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<Unit>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Unit> => {
    const response = await apiClient.get<ApiResponse<Unit>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUnitDto): Promise<Unit> => {
    const response = await apiClient.post<ApiResponse<Unit>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateUnitDto): Promise<Unit> => {
    const response = await apiClient.patch<ApiResponse<Unit>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};




