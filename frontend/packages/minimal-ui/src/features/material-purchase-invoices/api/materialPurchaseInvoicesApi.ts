import { apiClient } from '@/shared/api/client';
import { ApiResponse, PaginationResponse } from '@/shared/api/types';
import {
  CreateMaterialPurchaseInvoicePayload,
  MaterialPurchaseInvoice,
} from '../types';

const BASE_URL = '/material-purchase-invoices';

export const materialPurchaseInvoicesApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginationResponse<MaterialPurchaseInvoice>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await apiClient.get<ApiResponse<PaginationResponse<MaterialPurchaseInvoice>>>(
      `${BASE_URL}${query.toString() ? `?${query}` : ''}`,
    );
    return res.data.data;
  },

  getOne: async (id: string): Promise<MaterialPurchaseInvoice> => {
    const res = await apiClient.get<ApiResponse<MaterialPurchaseInvoice>>(`${BASE_URL}/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateMaterialPurchaseInvoicePayload): Promise<MaterialPurchaseInvoice> => {
    const formData = new FormData();
    if (payload.invoiceNumber) formData.append('invoiceNumber', payload.invoiceNumber);
    formData.append('party', payload.party);
    formData.append('invoiceDate', payload.invoiceDate);
    if (payload.description) formData.append('description', payload.description);
    formData.append('lines', JSON.stringify(payload.lines));
    if (payload.invoiceFile) formData.append('invoiceFile', payload.invoiceFile);

    const res = await apiClient.post<ApiResponse<MaterialPurchaseInvoice>>(BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};

export function materialInvoiceFileUrl(fileName?: string) {
  if (!fileName) return null;
  return `/uploads/material-invoices/${fileName}`;
}
