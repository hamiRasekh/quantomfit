import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import { paths } from '@/shared/routes/paths';
import {
  ProductionOrder,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  ProductionOrderListParams,
} from '../types';

const BASE_URL = '/production-orders';

export const productionOrdersApi = {
  getAll: async (params?: ProductionOrderListParams): Promise<PaginationResponse<ProductionOrder>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<PaginationResponse<ProductionOrder>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<ProductionOrder> => {
    const response = await apiClient.get<ApiResponse<ProductionOrder>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CreateProductionOrderDto): Promise<ProductionOrder> => {
    const response = await apiClient.post<ApiResponse<ProductionOrder>>(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateProductionOrderDto): Promise<ProductionOrder> => {
    const response = await apiClient.patch<ApiResponse<ProductionOrder>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  start: async (id: string): Promise<ProductionOrder> => {
    const response = await apiClient.post<ApiResponse<ProductionOrder>>(`${BASE_URL}/${id}/start`, {});
    return response.data.data;
  },

  complete: async (id: string): Promise<ProductionOrder> => {
    const response = await apiClient.post<ApiResponse<ProductionOrder>>(`${BASE_URL}/${id}/complete`, {});
    return response.data.data;
  },

  cancel: async (id: string): Promise<ProductionOrder> => {
    const response = await apiClient.post<ApiResponse<ProductionOrder>>(`${BASE_URL}/${id}/cancel`, {});
    return response.data.data;
  },
};

// Helper function to get print URL
export const getProductionOrderPrintUrl = (id: string): string => {
  return `${window.location.origin}${paths.productionOrders.print(id)}`;
};




