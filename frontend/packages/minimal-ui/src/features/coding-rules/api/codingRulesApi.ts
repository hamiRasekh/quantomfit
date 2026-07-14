import { apiClient } from '@/shared/api/client';
import {
  CodingRule,
  CreateCodingRuleDto,
  UpdateCodingRuleDto,
  CodingRuleListParams,
  CodingRuleEntityType,
} from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/coding-rules';

export const codingRulesApi = {
  getAll: async (
    params?: CodingRuleListParams,
  ): Promise<PaginationResponse<CodingRule>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.isActive !== undefined)
      queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<CodingRule>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<CodingRule> => {
    const response = await apiClient.get<ApiResponse<CodingRule>>(
      `${BASE_URL}/${id}`
    );
    return response.data.data;
  },

  create: async (data: CreateCodingRuleDto): Promise<CodingRule> => {
    const response = await apiClient.post<ApiResponse<CodingRule>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCodingRuleDto): Promise<CodingRule> => {
    const response = await apiClient.patch<ApiResponse<CodingRule>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};




