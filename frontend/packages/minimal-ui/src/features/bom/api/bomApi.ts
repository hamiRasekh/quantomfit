import { apiClient } from '@/shared/api/client';
import { BomItem, CreateBomItemDto, UpdateBomItemDto, BomListParams } from '../types';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';

const BASE_URL = '/bom';

export const bomApi = {
  getAll: async (params?: BomListParams): Promise<PaginationResponse<BomItem>> => {
    const queryParams = new URLSearchParams();
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.rawMaterialId) queryParams.append('rawMaterialId', params.rawMaterialId);

    const response = await apiClient.get<ApiResponse<PaginationResponse<BomItem>>>(
      `${BASE_URL}/items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getByProduct: async (productId: string): Promise<BomItem[]> => {
    const response = await apiClient.get<ApiResponse<BomItem[]>>(
      `${BASE_URL}/products/${productId}`
    );
    return response.data.data;
  },

  create: async (data: CreateBomItemDto): Promise<BomItem> => {
    const response = await apiClient.post<ApiResponse<BomItem>>(`${BASE_URL}/items`, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateBomItemDto): Promise<BomItem> => {
    const response = await apiClient.patch<ApiResponse<BomItem>>(`${BASE_URL}/items/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/items/${id}`);
  },
};




