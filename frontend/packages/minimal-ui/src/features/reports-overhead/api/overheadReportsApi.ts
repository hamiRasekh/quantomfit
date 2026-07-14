import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';
import { OverheadReportSummary, OverheadReportByProcess, OverheadReportParams } from '../types';

const BASE_URL = '/reports/overhead';

export const overheadReportsApi = {
  getSummary: async (params?: OverheadReportParams): Promise<OverheadReportSummary> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.processId) queryParams.append('processId', params.processId);

    const response = await apiClient.get<ApiResponse<OverheadReportSummary>>(
      `${BASE_URL}/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getByProcess: async (params?: OverheadReportParams): Promise<OverheadReportByProcess[]> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.processId) queryParams.append('processId', params.processId);

    const response = await apiClient.get<ApiResponse<OverheadReportByProcess[]>>(
      `${BASE_URL}/by-process${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },
};

