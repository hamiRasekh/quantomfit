import { apiClient } from '@/shared/api/client';
import { PaginationResponse, ApiResponse } from '@/shared/api/types';
import { Backup, CreateBackupDto, BackupListParams } from '../types';

const BASE_URL = '/system';

export const systemApi = {
  createBackup: async (data: CreateBackupDto): Promise<Backup> => {
    const response = await apiClient.post<ApiResponse<Backup>>(`${BASE_URL}/backup`, data);
    return response.data.data;
  },

  getAllBackups: async (params?: BackupListParams): Promise<PaginationResponse<Backup>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);

    const response = await apiClient.get<ApiResponse<PaginationResponse<Backup>>>(
      `${BASE_URL}/backup/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data.data;
  },

  downloadBackup: (id: string): string => {
    return `${apiClient.defaults.baseURL}${BASE_URL}/backup/${id}/download`;
  },
};

export const exportApi = {
  exportMasterData: (): string => {
    return `${apiClient.defaults.baseURL}/exports/master-data.zip`;
  },

  exportTransactions: (): string => {
    return `${apiClient.defaults.baseURL}/exports/transactions.zip`;
  },
};




