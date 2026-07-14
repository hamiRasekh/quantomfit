import { apiClient } from '@/shared/api/client';
import {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  ProductCategoryListParams,
} from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/product-categories';

export const productCategoriesApi = {
  getAll: async (
    params?: ProductCategoryListParams,
  ): Promise<PaginationResponse<ProductCategory>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined)
      queryParams.append('isActive', params.isActive.toString());

    const response = await apiClient.get<ApiResponse<PaginationResponse<ProductCategory>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<ProductCategory> => {
    const response = await apiClient.get<ApiResponse<ProductCategory>>(
      `${BASE_URL}/${id}`
    );
    return response.data.data;
  },

  create: async (data: CreateProductCategoryDto): Promise<ProductCategory> => {
    const response = await apiClient.post<ApiResponse<ProductCategory>>(
      BASE_URL,
      data
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: UpdateProductCategoryDto,
  ): Promise<ProductCategory> => {
    const response = await apiClient.patch<ApiResponse<ProductCategory>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};




