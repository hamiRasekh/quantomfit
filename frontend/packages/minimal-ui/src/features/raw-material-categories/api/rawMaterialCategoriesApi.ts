import { apiClient } from '@/shared/api/client';
import { ApiResponse, PaginationResponse } from '@/shared/api/types';
import {
  RawMaterialCategory,
  CreateRawMaterialCategoryDto,
  UpdateRawMaterialCategoryDto,
  RawMaterialCategoryListParams,
} from '../types';
import { Attribute } from '@/features/attributes/types';

const BASE_URL = '/raw-material-categories';

export const rawMaterialCategoriesApi = {
  getAll: async (
    params?: RawMaterialCategoryListParams,
  ): Promise<PaginationResponse<RawMaterialCategory>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<RawMaterialCategory>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<RawMaterialCategory> => {
    const response = await apiClient.get<ApiResponse<RawMaterialCategory>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateRawMaterialCategoryDto): Promise<RawMaterialCategory> => {
    const response = await apiClient.post<ApiResponse<RawMaterialCategory>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateRawMaterialCategoryDto): Promise<RawMaterialCategory> => {
    const response = await apiClient.patch<ApiResponse<RawMaterialCategory>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  getAttributeIds: async (id: string): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>(`${BASE_URL}/${id}/attribute-ids`);
    return response.data.data;
  },

  getAttributesWithValues: async (id: string, params?: { isActive?: boolean }): Promise<Attribute[]> => {
    const queryParams = new URLSearchParams();
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<Attribute[]>>(
      `${BASE_URL}/${id}/attributes-with-values${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    );
    return response.data.data;
  },
};

