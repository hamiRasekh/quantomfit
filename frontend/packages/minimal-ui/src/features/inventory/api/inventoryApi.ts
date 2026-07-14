import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';
import { StockBalance, InventoryListParams } from '../types';

const BASE_URL = '/inventory';

export const inventoryApi = {
  getBalances: async (params?: InventoryListParams): Promise<StockBalance[]> => {
    const queryParams = new URLSearchParams();
    if (params?.lowStockOnly) queryParams.append('lowStockOnly', 'true');
    if (params?.rawMaterialId) queryParams.append('rawMaterialId', params.rawMaterialId);

    const response = await apiClient.get<ApiResponse<StockBalance[]>>(
      `${BASE_URL}/balances${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  getLowStockAlerts: async (): Promise<StockBalance[]> => {
    const response = await apiClient.get<ApiResponse<StockBalance[]>>(
      `${BASE_URL}/alerts/low-stock`
    );
    return response.data.data;
  },
};




