import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import { Defect, CreateDefectDto, DefectListParams } from '../types';

const BASE_URL = '/defects';

export const defectsApi = {
  getAll: async (params?: DefectListParams): Promise<PaginationResponse<Defect>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.activityId) queryParams.append('activityId', params.activityId);
    if (params?.personnelId) queryParams.append('personnelId', params.personnelId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<PaginationResponse<Defect>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Defect> => {
    const response = await apiClient.get<ApiResponse<Defect>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateDefectDto): Promise<Defect> => {
    const response = await apiClient.post<ApiResponse<Defect>>(BASE_URL, data);
    return response.data.data;
  },
};




