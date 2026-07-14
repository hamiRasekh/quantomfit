'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { DashboardSummary, DashboardSummaryParams, PendingApproval, PendingApprovalsListParams } from '../types';

// ----------------------------------------------------------------------

type UseDashboardSummaryParams = {
  fromDate?: string;
  toDate?: string;
  enabled?: boolean;
};

export function useDashboardSummary({ fromDate, toDate, enabled = true }: UseDashboardSummaryParams = {}) {
  const key = enabled && (fromDate || toDate !== undefined)
    ? ['dashboard/summary', fromDate, toDate]
    : null;

  const { data, error, isLoading, mutate } = useSWR<DashboardSummary>(
    key,
    async () => {
      const params: DashboardSummaryParams = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      return dashboardApi.getSummary(params);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Cache for 5 seconds
    }
  );

  return {
    summary: data,
    summaryLoading: isLoading,
    summaryError: error,
    mutateSummary: mutate,
  };
}

// ----------------------------------------------------------------------

type UsePendingApprovalsParams = {
  page?: number;
  limit?: number;
  enabled?: boolean;
};

export function usePendingApprovals({ page = 1, limit = 10, enabled = true }: UsePendingApprovalsParams = {}) {
  const key = enabled ? ['dashboard/pending-approvals', page, limit] : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const params: PendingApprovalsListParams = { page, limit };
      return dashboardApi.getPendingApprovals(params);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    pendingApprovals: data?.data || [],
    pendingApprovalsLoading: isLoading,
    pendingApprovalsError: error,
    mutatePendingApprovals: mutate,
  };
}

