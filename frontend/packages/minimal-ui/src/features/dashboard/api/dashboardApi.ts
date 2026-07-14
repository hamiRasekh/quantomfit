import { apiClient } from '@/shared/api/client';
import {
  DashboardSummary,
  DashboardSummaryParams,
  PendingApproval,
  PendingApprovalsListParams,
} from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/dashboard';

export const dashboardApi = {
  getSummary: async (params?: DashboardSummaryParams): Promise<DashboardSummary> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<DashboardSummary>>(
      `${BASE_URL}/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getPendingApprovals: async (
    params?: PendingApprovalsListParams,
  ): Promise<PaginationResponse<PendingApproval>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<PendingApproval>>>(
      `${BASE_URL}/pending-approvals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },
};
