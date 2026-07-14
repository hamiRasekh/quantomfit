'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

import { financialDashboardApi } from '../api/financialDashboardApi';
import { FinancialFilters, FinancialPageId, FinancialPagePayload } from '../types';

export function useFinancialPage(pageId: FinancialPageId) {
  const { financialCurrencyUnit } = useTenantPageTheme();
  const [filters, setFilters] = useState<FinancialFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FinancialPagePayload | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await financialDashboardApi.getPage(pageId, filters, financialCurrencyUnit);
      setData(payload);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری داده مالی');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [pageId, filters, financialCurrencyUnit]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    filters,
    setFilters,
    loading,
    error,
    data,
    refresh: load,
    currencyUnit: financialCurrencyUnit,
  };
}
