import { apiClient } from '@/shared/api/client';
import { Personnel, CreatePersonnelDto, UpdatePersonnelDto, PersonnelListParams } from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/personnel';

export const personnelApi = {
  getAll: async (params?: PersonnelListParams): Promise<PaginationResponse<Personnel>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.positionId) queryParams.append('positionId', params.positionId);

    const response = await apiClient.get<ApiResponse<PaginationResponse<Personnel>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    // Backend wraps response: { statusCode, message, data: { data: [], total, page, ... }, timestamp }
    return response.data.data;
  },

  getById: async (id: string): Promise<Personnel> => {
    const response = await apiClient.get<ApiResponse<Personnel>>(`${BASE_URL}/${id}`);
    // Backend wraps response: { statusCode, message, data: Personnel, timestamp }
    return response.data.data;
  },

  create: async (data: CreatePersonnelDto): Promise<Personnel> => {
    const response = await apiClient.post<ApiResponse<Personnel>>(BASE_URL, data);
    // Backend wraps response: { statusCode, message, data: Personnel, timestamp }
    return response.data.data;
  },

  update: async (id: string, data: UpdatePersonnelDto): Promise<Personnel> => {
    const response = await apiClient.patch<ApiResponse<Personnel>>(`${BASE_URL}/${id}`, data);
    // Backend wraps response: { statusCode, message, data: Personnel, timestamp }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};

