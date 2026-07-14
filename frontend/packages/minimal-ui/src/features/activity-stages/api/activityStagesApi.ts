import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';
import {
  ActivityStage,
  CreateActivityStageDto,
  UpdateActivityStageDto,
} from '../types';

const BASE_URL = '/activity-stages';

export const activityStagesApi = {
  listByActivity: async (activityId: string): Promise<ActivityStage[]> => {
    const response = await apiClient.get<ApiResponse<ActivityStage[]>>(
      `${BASE_URL}?activityId=${activityId}`,
    );
    return response.data.data;
  },

  create: async (data: CreateActivityStageDto): Promise<ActivityStage> => {
    const response = await apiClient.post<ApiResponse<ActivityStage>>(
      BASE_URL,
      data,
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: UpdateActivityStageDto,
  ): Promise<ActivityStage> => {
    const response = await apiClient.patch<ApiResponse<ActivityStage>>(
      `${BASE_URL}/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};


