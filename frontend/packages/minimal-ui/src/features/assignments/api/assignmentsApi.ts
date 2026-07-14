import { apiClient } from '@/shared/api/client';
import {
  Assignment,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  AssignmentListParams,
  AvailablePersonnel,
  AssignmentTimeLog,
} from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/assignments';

export const assignmentsApi = {
  getAll: async (
    params?: AssignmentListParams,
  ): Promise<PaginationResponse<Assignment>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.personnelId) queryParams.append('personnelId', params.personnelId);
      if (params?.productId) queryParams.append('productId', params.productId);
      if (params?.activityId) queryParams.append('activityId', params.activityId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params?.toDate) queryParams.append('toDate', params.toDate);
      if (params?.search) queryParams.append('search', params.search);
      // orderId not supported by backend GET /assignments - filter by orderId on client if needed

      const response = await apiClient.get<ApiResponse<PaginationResponse<Assignment>>>(
        `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      );
      // Backend: { statusCode, message, data: { data: [], total, page, limit, totalPages }, timestamp }
      const result = response.data;
      const pagination = result && typeof result === 'object' && 'data' in result ? (result as any).data : result;
      if (pagination && typeof pagination === 'object' && Array.isArray(pagination.data) && 'total' in pagination) {
        return pagination as PaginationResponse<Assignment>;
      }
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    } catch (error: any) {
      const errorDetails: Record<string, any> = {
        url: `${BASE_URL}${params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()}` : ''}`,
      };
      
      // Try to extract error information
      if (error) {
        if (typeof error === 'string') {
          errorDetails.message = error;
        } else if (typeof error === 'object') {
          errorDetails.message = error.message || error.toString();
          errorDetails.statusCode = error.statusCode;
          errorDetails.error = error.error;
          if (error.response) {
            errorDetails.responseData = error.response.data;
            errorDetails.responseStatus = error.response.status;
          }
          if (error.stack) {
            errorDetails.stack = error.stack;
          }
          // Log all error properties
          errorDetails.errorKeys = Object.keys(error);
          errorDetails.errorStringified = JSON.stringify(error, null, 2);
        }
      }
      
      console.error('Error in assignmentsApi.getAll', errorDetails);
      throw error;
    }
  },

  getById: async (id: string): Promise<Assignment> => {
    const response = await apiClient.get<ApiResponse<Assignment>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateAssignmentDto): Promise<Assignment> => {
    const response = await apiClient.post<ApiResponse<Assignment>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateAssignmentDto): Promise<Assignment> => {
    const response = await apiClient.patch<ApiResponse<Assignment>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  approve: async (id: string): Promise<Assignment> => {
    const response = await apiClient.patch<ApiResponse<Assignment>>(
      `${BASE_URL}/${id}/approve`,
      {}
    );
    return response.data.data;
  },

  return: async (id: string, reason: string): Promise<Assignment> => {
    const response = await apiClient.patch<ApiResponse<Assignment>>(
      `${BASE_URL}/${id}/return`,
      { reason }
    );
    return response.data.data;
  },

  cancel: async (id: string, reason?: string): Promise<Assignment> => {
    const response = await apiClient.patch<ApiResponse<Assignment>>(
      `${BASE_URL}/${id}/cancel`,
      reason ? { reason } : {}
    );
    return response.data.data;
  },

  /** تکمیل واگذاری از لیست (وضعیت → تکمیل شده، تایمر متوقف) */
  complete: async (id: string): Promise<Assignment> => {
    const response = await apiClient.patch<ApiResponse<Assignment>>(
      `${BASE_URL}/${id}/complete`,
      {}
    );
    return response.data.data;
  },

  getAvailablePersonnel: async (
    activityId: string,
    processId?: string,
  ): Promise<AvailablePersonnel[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('activityId', activityId);
    if (processId) queryParams.append('processId', processId);

    const response = await apiClient.get<ApiResponse<AvailablePersonnel[]>>(
      `${BASE_URL}/available-personnel?${queryParams.toString()}`
    );
    return response.data.data;
  },

  createForOrder: async (data: CreateAssignmentDto): Promise<Assignment> => {
    const response = await apiClient.post<ApiResponse<Assignment>>(
      `${BASE_URL}/for-order`,
      data
    );
    return response.data.data;
  },

  getTimeLogs: async (id: string): Promise<AssignmentTimeLog[]> => {
    const response = await apiClient.get<ApiResponse<AssignmentTimeLog[]>>(
      `${BASE_URL}/${id}/time-logs`
    );
    return response.data.data;
  },

  getPersonnelTimeLogs: async (personnelId: string): Promise<AssignmentTimeLog[]> => {
    const response = await apiClient.get<ApiResponse<AssignmentTimeLog[]>>(
      `${BASE_URL}/personnel/${personnelId}/time-logs`
    );
    return response.data.data;
  },

  /** ریز لاگ های کار برای یک پروژه/سفارش */
  getOrderTimeLogs: async (
    orderId: string,
  ): Promise<
    Array<{
      assignmentId: string;
      productName: string;
      activityName: string;
      personnelName: string;
      quantity: number;
      status: string;
      logs: AssignmentTimeLog[];
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          assignmentId: string;
          productName: string;
          activityName: string;
          personnelName: string;
          quantity: number;
          status: string;
          logs: AssignmentTimeLog[];
        }>
      >
    >(`${BASE_URL}/order/${orderId}/time-logs`);
    return response.data.data;
  },
};




