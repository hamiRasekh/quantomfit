import { apiClient } from '@/shared/api/client';
import { Activity, CreateActivityDto, UpdateActivityDto, ActivityListParams } from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/activities';

export const activitiesApi = {
  getAll: async (params?: ActivityListParams): Promise<PaginationResponse<Activity>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.processId) queryParams.append('processId', params.processId);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.unitId) queryParams.append('unitId', params.unitId);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<Activity>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Activity> => {
    const response = await apiClient.get<ApiResponse<Activity>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateActivityDto): Promise<Activity> => {
    const response = await apiClient.post<ApiResponse<Activity>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateActivityDto): Promise<Activity> => {
    const response = await apiClient.patch<ApiResponse<Activity>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};




