import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import {
  RawMaterial,
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
  RawMaterialListParams,
} from '../types';

const BASE_URL = '/raw-materials';

export const rawMaterialsApi = {
  getAll: async (params?: RawMaterialListParams): Promise<PaginationResponse<RawMaterial>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<RawMaterial>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<RawMaterial> => {
    const response = await apiClient.get<ApiResponse<RawMaterial>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateRawMaterialDto): Promise<RawMaterial> => {
    const response = await apiClient.post<ApiResponse<RawMaterial>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateRawMaterialDto): Promise<RawMaterial> => {
    const response = await apiClient.patch<ApiResponse<RawMaterial>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};

