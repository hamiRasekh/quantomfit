import { apiClient } from '@/shared/api/client';
import {
  WageReportSummary,
  WageReportByPersonnel,
  WageReportByProcess,
  WageReportByActivity,
  WageReportParams,
} from '../types';
import { ApiResponse } from '@/shared/api/types';

const BASE_URL = '/reports/wages';

export const wageReportsApi = {
  getSummary: async (params?: WageReportParams): Promise<WageReportSummary> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.personnelId) queryParams.append('personnelId', params.personnelId);
    if (params?.processId) queryParams.append('processId', params.processId);
    if (params?.activityId) queryParams.append('activityId', params.activityId);

    const response = await apiClient.get<ApiResponse<WageReportSummary>>(
      `${BASE_URL}/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getByPersonnel: async (params?: WageReportParams): Promise<WageReportByPersonnel[]> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<WageReportByPersonnel[]>>(
      `${BASE_URL}/by-personnel${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getByProcess: async (params?: WageReportParams): Promise<WageReportByProcess[]> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<WageReportByProcess[]>>(
      `${BASE_URL}/by-process${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getByActivity: async (params?: WageReportParams): Promise<WageReportByActivity[]> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.personnelId) queryParams.append('personnelId', params.personnelId);
    if (params?.processId) queryParams.append('processId', params.processId);
    if (params?.activityId) queryParams.append('activityId', params.activityId);

    const response = await apiClient.get<ApiResponse<WageReportByActivity[]>>(
      `${BASE_URL}/by-activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  exportToExcel: async (params?: WageReportParams): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.personnelId) queryParams.append('personnelId', params.personnelId);
    if (params?.processId) queryParams.append('processId', params.processId);
    if (params?.activityId) queryParams.append('activityId', params.activityId);

    const response = await apiClient.get(`${BASE_URL}/export/excel${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportToCSV: async (params?: WageReportParams): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.personnelId) queryParams.append('personnelId', params.personnelId);
    if (params?.processId) queryParams.append('processId', params.processId);
    if (params?.activityId) queryParams.append('activityId', params.activityId);

    const response = await apiClient.get(`${BASE_URL}/export/csv${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};




