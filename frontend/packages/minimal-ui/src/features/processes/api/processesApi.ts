import { apiClient } from '@/shared/api/client';
import { Process, CreateProcessDto, UpdateProcessDto, ProcessListParams } from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/processes';

export const processesApi = {
  getAll: async (params?: ProcessListParams): Promise<PaginationResponse<Process>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<Process> | Process[]>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    
    // Handle both array response and paginated response
    const responseData = response.data.data;
    if (Array.isArray(responseData)) {
      // If response is an array, convert it to PaginationResponse
      return {
        data: responseData,
        total: responseData.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: Math.ceil(responseData.length / (params?.limit || 10)),
      };
    }
    
    // If response is already PaginationResponse
    return responseData;
  },

  getById: async (id: string): Promise<Process> => {
    const response = await apiClient.get<ApiResponse<Process>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateProcessDto): Promise<Process> => {
    const response = await apiClient.post<ApiResponse<Process>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateProcessDto): Promise<Process> => {
    const response = await apiClient.patch<ApiResponse<Process>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};




