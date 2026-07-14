import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';

import { WeatherResponse } from '../types';

export const weatherApi = {
  getWeather: async (params?: { date?: string; lat?: number; lng?: number }): Promise<WeatherResponse> => {
    const response = await apiClient.get<ApiResponse<WeatherResponse>>('/weather', {
      params: {
        date: params?.date,
        lat: params?.lat,
        lng: params?.lng,
      },
    });
    return response.data.data;
  },
};
