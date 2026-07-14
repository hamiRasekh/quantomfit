import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';
import { DefectReportSummary, DefectReportParams } from '../types';

const BASE_URL = '/reports/defects';

export const defectReportsApi = {
  getSummary: async (params?: DefectReportParams): Promise<DefectReportSummary> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.activityId) queryParams.append('activityId', params.activityId);

    const response = await apiClient.get<ApiResponse<DefectReportSummary>>(
      `${BASE_URL}/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },
};




