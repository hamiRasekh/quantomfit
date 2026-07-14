import { apiClient } from '@/shared/api/client';
import { ProductCostSummary, ProductCostParams } from '../types';
import { ApiResponse } from '@/shared/api/types';

const BASE_URL = '/reports/product-cost';

export const productCostReportsApi = {
  getSummary: async (params?: ProductCostParams): Promise<ProductCostSummary[]> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.targetQuantity) queryParams.append('targetQuantity', params.targetQuantity.toString());

    const response = await apiClient.get<ApiResponse<ProductCostSummary[]>>(
      `${BASE_URL}/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getByProduct: async (productId: string, params?: ProductCostParams): Promise<ProductCostSummary> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.targetQuantity) queryParams.append('targetQuantity', params.targetQuantity.toString());

    const response = await apiClient.get<ApiResponse<ProductCostSummary>>(
      `${BASE_URL}/${productId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  exportToExcel: async (params?: ProductCostParams): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.targetQuantity) queryParams.append('targetQuantity', params.targetQuantity.toString());

    const response = await apiClient.get(
      `${BASE_URL}/export/excel${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  exportToCSV: async (params?: ProductCostParams): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.targetQuantity) queryParams.append('targetQuantity', params.targetQuantity.toString());

    const response = await apiClient.get(
      `${BASE_URL}/export/csv${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};




