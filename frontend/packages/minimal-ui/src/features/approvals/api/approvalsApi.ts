import { apiClient } from '@/shared/api/client';
import {
  ApprovalActionDto,
  BulkApprovalDto,
  ApprovalListParams,
  ApprovalRecord,
} from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/approvals';

export const approvalsApi = {
  getPending: async (
    params?: ApprovalListParams,
  ): Promise<PaginationResponse<ApprovalRecord>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.personnelId) queryParams.append('personnelId', params.personnelId);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.activityId) queryParams.append('activityId', params.activityId);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<PaginationResponse<ApprovalRecord>>>(
      `${BASE_URL}/pending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  approve: async (recordId: string, dto?: ApprovalActionDto): Promise<ApprovalRecord> => {
    const response = await apiClient.post<ApiResponse<ApprovalRecord>>(
      `${BASE_URL}/${recordId}/approve`,
      dto || {}
    );
    return response.data.data;
  },

  reject: async (recordId: string, dto: ApprovalActionDto): Promise<ApprovalRecord> => {
    const response = await apiClient.post<ApiResponse<ApprovalRecord>>(
      `${BASE_URL}/${recordId}/reject`,
      dto
    );
    return response.data.data;
  },

  bulkApprove: async (recordIds: string[], managerNote?: string): Promise<{ processed: number; errors: string[] }> => {
    const response = await apiClient.post<ApiResponse<{ processed: number; errors: string[] }>>(
      `${BASE_URL}/bulk`,
      {
        action: 'APPROVE',
        recordIds,
        managerNote,
      } as BulkApprovalDto
    );
    return response.data.data;
  },

  bulkReject: async (recordIds: string[], managerNote: string): Promise<{ processed: number; errors: string[] }> => {
    const response = await apiClient.post<ApiResponse<{ processed: number; errors: string[] }>>(
      `${BASE_URL}/bulk`,
      {
        action: 'REJECT',
        recordIds,
        managerNote,
      } as BulkApprovalDto
    );
    return response.data.data;
  },
};
