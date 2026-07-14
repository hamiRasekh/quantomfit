import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';
import { FinancialCurrencyUnit } from '@/features/tenant-panel/theme';

import { buildFinancialPagePayload } from './buildPagePayload';
import { FinancialAggregate } from '../types/aggregate';
import { FinancialFilters, FinancialPageId, FinancialPagePayload } from '../types';
import {
  FinancialAssetDepreciation,
  FinancialExecutiveSummary,
  FinancialNonOperatingEntry,
} from '../types/advanced';

const BASE_URL = '/financial';

function appendFilters(params: URLSearchParams, filters: FinancialFilters) {
  if (filters.plantId) params.set('plantId', filters.plantId);
  if (filters.customerId) params.set('customerId', filters.customerId);
  if (filters.projectId) params.set('projectId', filters.projectId);
  if (filters.concreteGrade) params.set('concreteGrade', filters.concreteGrade);
  if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
  if (filters.supplierId) params.set('supplierId', filters.supplierId);
  if (filters.fleetId) params.set('fleetId', filters.fleetId);
  if (filters.dateFrom && /^\d{4}-\d{2}-\d{2}/.test(filters.dateFrom)) {
    params.set('fromDate', filters.dateFrom);
  }
  if (filters.dateTo && /^\d{4}-\d{2}-\d{2}/.test(filters.dateTo)) {
    params.set('toDate', filters.dateTo);
  }
}

export const financialDashboardApi = {
  getAggregate: async (filters: FinancialFilters = {}): Promise<FinancialAggregate> => {
    const params = new URLSearchParams();
    appendFilters(params, filters);
    const qs = params.toString();
    const response = await apiClient.get<ApiResponse<FinancialAggregate>>(
      `${BASE_URL}/aggregate${qs ? `?${qs}` : ''}`,
    );
    return response.data.data;
  },

  getExecutiveSummary: async (
    filters: FinancialFilters = {},
    _currencyUnit?: FinancialCurrencyUnit,
  ): Promise<FinancialExecutiveSummary> => {
    const params = new URLSearchParams();
    appendFilters(params, filters);
    const qs = params.toString();
    const response = await apiClient.get<ApiResponse<FinancialExecutiveSummary>>(
      `${BASE_URL}/executive-summary${qs ? `?${qs}` : ''}`,
    );
    return response.data.data;
  },

  listDepreciation: async (): Promise<FinancialAssetDepreciation[]> => {
    const response = await apiClient.get<ApiResponse<FinancialAssetDepreciation[]>>(
      `${BASE_URL}/depreciation`,
    );
    return response.data.data;
  },

  createDepreciation: async (
    payload: Omit<FinancialAssetDepreciation, 'id'>,
  ): Promise<FinancialAssetDepreciation> => {
    const response = await apiClient.post<ApiResponse<FinancialAssetDepreciation>>(
      `${BASE_URL}/depreciation`,
      payload,
    );
    return response.data.data;
  },

  listNonOperating: async (): Promise<FinancialNonOperatingEntry[]> => {
    const response = await apiClient.get<ApiResponse<FinancialNonOperatingEntry[]>>(
      `${BASE_URL}/non-operating`,
    );
    return response.data.data;
  },

  createNonOperating: async (
    payload: Omit<FinancialNonOperatingEntry, 'id'>,
  ): Promise<FinancialNonOperatingEntry> => {
    const response = await apiClient.post<ApiResponse<FinancialNonOperatingEntry>>(
      `${BASE_URL}/non-operating`,
      payload,
    );
    return response.data.data;
  },

  getPage: async (
    pageId: FinancialPageId,
    filters: FinancialFilters,
    currencyUnit: FinancialCurrencyUnit,
  ): Promise<FinancialPagePayload> => {
    const aggregate = await financialDashboardApi.getAggregate(filters);
    return buildFinancialPagePayload(pageId, filters, currencyUnit, aggregate);
  },
};
