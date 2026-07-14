import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import {
  Position,
  CreatePositionDto,
  UpdatePositionDto,
  PositionListParams,
} from '../types';

const BASE_URL = '/positions';

export const positionsApi = {
  getAll: async (
    params?: PositionListParams,
  ): Promise<PaginationResponse<Position>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId);

    const response = await apiClient.get<
      ApiResponse<PaginationResponse<Position>>
    >(`${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    return response.data.data;
  },

  create: async (data: CreatePositionDto): Promise<Position> => {
    const response = await apiClient.post<ApiResponse<Position>>(
      BASE_URL,
      data,
    );
    return response.data.data;
  },

  update: async (id: string, data: UpdatePositionDto): Promise<Position> => {
    const response = await apiClient.patch<ApiResponse<Position>>(
      `${BASE_URL}/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};


