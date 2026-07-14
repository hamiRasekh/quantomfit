import { apiClient } from '@/shared/api/client';
import {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  OrderListParams,
  OrderWageReport,
  OrderProgressReport,
  OrderMaterialsReport,
  OrderWithPriority,
  OrderActivityProgress,
  ProcessActivitiesByCategoryItem,
} from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/orders';

export const ordersApi = {
    getAll: async (params?: OrderListParams): Promise<PaginationResponse<Order>> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);

        const response = await apiClient.get<ApiResponse<PaginationResponse<Order>>>(
            `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        );
        return response.data.data; 
        // Wait, in productsApi it was response.data.data. 
        // Let's check backend response format. 
        // PaginationResponseDto usually is data + meta.
        // ApiResponse usually wraps it.
        // I'll stick to response.data.data based on productsApi pattern.
    },

    getById: async (id: string): Promise<Order> => {
        const response = await apiClient.get<ApiResponse<Order>>(`${BASE_URL}/${id}`);
        return response.data.data;
    },

    create: async (data: CreateOrderDto): Promise<Order> => {
        const response = await apiClient.post<ApiResponse<Order>>(BASE_URL, data);
        return response.data.data;
    },

    update: async (id: string, data: UpdateOrderDto): Promise<Order> => {
        const response = await apiClient.patch<ApiResponse<Order>>(`${BASE_URL}/${id}`, data);
        return response.data.data;
    },

    updateItemStatus: async (orderId: string, itemId: string, status: string): Promise<Order> => {
        const response = await apiClient.patch<ApiResponse<Order>>(
            `${BASE_URL}/${orderId}/items/${itemId}/status`,
            { status }
        );
        return response.data.data;
    },

    getProgress: async (id: string): Promise<{ progress: number; status: string }> => {
        const response = await apiClient.get<ApiResponse<{ progress: number; status: string }>>(
            `${BASE_URL}/${id}/progress`
        );
        return response.data.data;
    },

    getWageReport: async (id: string): Promise<OrderWageReport> => {
        const response = await apiClient.get<ApiResponse<OrderWageReport>>(
            `${BASE_URL}/${id}/reports/wages`
        );
        return response.data.data;
    },

    getProgressReport: async (id: string): Promise<OrderProgressReport> => {
        const response = await apiClient.get<ApiResponse<OrderProgressReport>>(
            `${BASE_URL}/${id}/reports/progress`
        );
        return response.data.data;
    },

    getMaterialsReport: async (id: string): Promise<OrderMaterialsReport> => {
        const response = await apiClient.get<ApiResponse<OrderMaterialsReport>>(
            `${BASE_URL}/${id}/reports/materials`
        );
        return response.data.data;
    },

    confirmMaterialsSupplied: async (id: string): Promise<Order> => {
        const response = await apiClient.patch<ApiResponse<Order>>(
            `${BASE_URL}/${id}/confirm-materials-supplied`
        );
        return response.data.data;
    },

    getOpenOrders: async (): Promise<OrderWithPriority[]> => {
        const response = await apiClient.get<ApiResponse<OrderWithPriority[]>>(
            `${BASE_URL}/open`
        );
        return response.data.data;
    },

    getActivityProgress: async (id: string): Promise<OrderActivityProgress[]> => {
        const response = await apiClient.get<ApiResponse<OrderActivityProgress[]>>(
            `${BASE_URL}/${id}/activity-progress`
        );
        return response.data.data;
    },

    /** Get process+activity rows for adding by activity category (for order form) */
    expandByCategory: async (
        activityCategoryId: string
    ): Promise<ProcessActivitiesByCategoryItem[]> => {
        const response = await apiClient.get<
            ApiResponse<ProcessActivitiesByCategoryItem[]>
        >(`${BASE_URL}/expand-by-category?activityCategoryId=${encodeURIComponent(activityCategoryId)}`);
        return response.data.data;
    },
};
