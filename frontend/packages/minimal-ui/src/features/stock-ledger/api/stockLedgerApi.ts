import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import { StockLedger, CreateLedgerEntryDto, StockLedgerListParams } from '../types';

const BASE_URL = '/stock-ledger';

export const stockLedgerApi = {
  getAll: async (params?: StockLedgerListParams): Promise<PaginationResponse<StockLedger>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.rawMaterialId) queryParams.append('rawMaterialId', params.rawMaterialId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<PaginationResponse<StockLedger>>>(
      `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  create: async (data: CreateLedgerEntryDto): Promise<StockLedger> => {
    const response = await apiClient.post<ApiResponse<StockLedger>>(BASE_URL, data);
    return response.data.data;
  },
};




