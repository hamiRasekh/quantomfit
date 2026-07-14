import { apiClient } from '@/shared/api/client';
import {
  ActivityCategory,
  CreateActivityCategoryDto,
  UpdateActivityCategoryDto,
  ActivityCategoryListParams,
} from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/activity-categories';

export const activityCategoriesApi = {
  getAll: async (
    params?: ActivityCategoryListParams,
  ): Promise<PaginationResponse<ActivityCategory>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<ActivityCategory>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    const responseData = response.data?.data;
    if (Array.isArray(responseData)) {
      return {
        data: responseData,
        total: responseData.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: Math.ceil(responseData.length / (params?.limit || 10)),
      };
    }
    return responseData as PaginationResponse<ActivityCategory>;
  },

  getById: async (id: string): Promise<ActivityCategory> => {
    const response = await apiClient.get<ApiResponse<ActivityCategory>>(
      `${BASE_URL}/${id}`
    );
    return response.data.data;
  },

  create: async (data: CreateActivityCategoryDto): Promise<ActivityCategory> => {
    const response = await apiClient.post<ApiResponse<ActivityCategory>>(
      BASE_URL,
      data
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: UpdateActivityCategoryDto,
  ): Promise<ActivityCategory> => {
    const response = await apiClient.patch<ApiResponse<ActivityCategory>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};

