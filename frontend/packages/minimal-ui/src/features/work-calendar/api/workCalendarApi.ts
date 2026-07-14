import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import {
  WorkCalendarSettings,
  WorkDay,
  UpdateWorkCalendarSettingsDto,
  CreateHolidayDto,
  WorkCalendarListParams,
  UpdateHolidayDto,
} from '../types';

const BASE_URL = '/work-calendar';

export const workCalendarApi = {
  getSettings: async (): Promise<WorkCalendarSettings> => {
    const response = await apiClient.get<ApiResponse<WorkCalendarSettings>>(`${BASE_URL}/settings`);
    return response.data.data;
  },

  updateSettings: async (data: UpdateWorkCalendarSettingsDto): Promise<WorkCalendarSettings> => {
    const response = await apiClient.patch<ApiResponse<WorkCalendarSettings>>(
      `${BASE_URL}/settings`,
      data
    );
    return response.data.data;
  },

  getAllHolidays: async (params?: WorkCalendarListParams): Promise<PaginationResponse<WorkDay>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<WorkDay>>>(
      `${BASE_URL}/holidays${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  createHoliday: async (data: CreateHolidayDto): Promise<WorkDay> => {
    const response = await apiClient.post<ApiResponse<WorkDay>>(`${BASE_URL}/holidays`, data);
    return response.data.data;
  },

  updateHoliday: async (id: string, data: UpdateHolidayDto): Promise<WorkDay> => {
    const response = await apiClient.patch<ApiResponse<WorkDay>>(`${BASE_URL}/holidays/${id}`, data);
    return response.data.data;
  },

  deleteHoliday: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/holidays/${id}`);
  },
};




