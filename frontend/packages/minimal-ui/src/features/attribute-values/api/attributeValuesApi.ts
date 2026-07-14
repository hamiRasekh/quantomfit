import { apiClient } from '@/shared/api/client';
import { ApiResponse, PaginationResponse } from '@/shared/api/types';
import {
  AttributeValue,
  AttributeValueListParams,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
} from '../types';

export const attributeValuesApi = {
  getAllByAttribute: async (
    attributeId: string,
    params?: AttributeValueListParams,
  ): Promise<PaginationResponse<AttributeValue>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<AttributeValue>>>(
      `/attributes/${attributeId}/values${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    );
    return response.data.data;
  },

  createForAttribute: async (
    attributeId: string,
    data: CreateAttributeValueDto,
  ): Promise<AttributeValue> => {
    const response = await apiClient.post<ApiResponse<AttributeValue>>(
      `/attributes/${attributeId}/values`,
      data,
    );
    return response.data.data;
  },

  update: async (id: string, data: UpdateAttributeValueDto): Promise<AttributeValue> => {
    const response = await apiClient.patch<ApiResponse<AttributeValue>>(`/attribute-values/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/attribute-values/${id}`);
  },
};

