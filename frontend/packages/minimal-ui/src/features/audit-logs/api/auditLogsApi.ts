import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import { AuditLog, AuditLogListParams } from '../types';

const BASE_URL = '/audit-logs';

export const auditLogsApi = {
  getAll: async (params?: AuditLogListParams): Promise<PaginationResponse<AuditLog>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.entity) queryParams.append('entity', params.entity);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<PaginationResponse<AuditLog>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<AuditLog> => {
    const response = await apiClient.get<ApiResponse<AuditLog>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },
};




