import { apiClient } from '@/shared/api/client';
import { Customer, CreateCustomerDto, UpdateCustomerDto, CustomerListParams } from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/customers';

export const customersApi = {
    getAll: async (params?: CustomerListParams): Promise<PaginationResponse<Customer>> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);

        const response = await apiClient.get<ApiResponse<PaginationResponse<Customer>>>(
            `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        );
        return response.data.data;
    },

    getById: async (id: string): Promise<Customer> => {
        const response = await apiClient.get<ApiResponse<Customer>>(`${BASE_URL}/${id}`);
        return response.data.data;
    },

    create: async (data: CreateCustomerDto): Promise<Customer> => {
        const response = await apiClient.post<ApiResponse<Customer>>(BASE_URL, data);
        return response.data.data;
    },

    update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
        const response = await apiClient.patch<ApiResponse<Customer>>(`${BASE_URL}/${id}`, data);
        return response.data.data;
    },

    uploadContract: async (id: string, file: File): Promise<Customer> => {
        const formData = new FormData();
        formData.append('contract', file);
        const response = await apiClient.post<ApiResponse<Customer>>(
            `${BASE_URL}/${id}/contract`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data.data;
    },

    removeContract: async (id: string): Promise<Customer> => {
        const response = await apiClient.delete<ApiResponse<Customer>>(`${BASE_URL}/${id}/contract`);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },
};
