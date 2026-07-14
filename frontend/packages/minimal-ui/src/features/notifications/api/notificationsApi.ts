import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import { Notification, NotificationListParams } from '../types';

const BASE_URL = '/notifications';

export const notificationsApi = {
  getAll: async (params?: NotificationListParams): Promise<PaginationResponse<Notification>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
    if (params?.type) queryParams.append('type', params.type);

    const response = await apiClient.get<ApiResponse<PaginationResponse<Notification>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<number>>(`${BASE_URL}/unread-count`);
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`${BASE_URL}/${id}/read`, {});
  },
};




