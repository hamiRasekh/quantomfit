import { apiClient } from '@/shared/api/client';
import { ApiResponse, PaginationResponse } from '@/shared/api/types';
import { Attribute, AttributeListParams, CreateAttributeDto, UpdateAttributeDto } from '../types';

const BASE_URL = '/attributes';

export const attributesApi = {
  getAll: async (params?: AttributeListParams): Promise<PaginationResponse<Attribute>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<Attribute>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    );
    return response.data.data;
  },

  getAllWithValues: async (params?: { isActive?: boolean }): Promise<Attribute[]> => {
    const queryParams = new URLSearchParams();
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<Attribute[]>>(
      `${BASE_URL}/with-values${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Attribute> => {
    const response = await apiClient.get<ApiResponse<Attribute>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateAttributeDto): Promise<Attribute> => {
    const response = await apiClient.post<ApiResponse<Attribute>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateAttributeDto): Promise<Attribute> => {
    const response = await apiClient.patch<ApiResponse<Attribute>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};

