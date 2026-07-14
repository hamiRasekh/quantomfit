import { apiClient } from '@/shared/api/client';
import {
  ActivityRecord,
  CreateActivityRecordDto,
  UpdateActivityRecordDto,
  ActivityRecordListParams,
} from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/activity-records';

export const activityRecordsApi = {
  getAll: async (
    params?: ActivityRecordListParams,
  ): Promise<PaginationResponse<ActivityRecord>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.personnelId) queryParams.append('personnelId', params.personnelId);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.activityId) queryParams.append('activityId', params.activityId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<PaginationResponse<ActivityRecord>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<ActivityRecord> => {
    const response = await apiClient.get<ApiResponse<ActivityRecord>>(
      `${BASE_URL}/${id}`
    );
    return response.data.data;
  },

  create: async (data: CreateActivityRecordDto): Promise<ActivityRecord> => {
    const response = await apiClient.post<ApiResponse<ActivityRecord>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateActivityRecordDto): Promise<ActivityRecord> => {
    const response = await apiClient.patch<ApiResponse<ActivityRecord>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};




