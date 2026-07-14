'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

import { FinancialHubShell } from '../components/FinancialHubShell';
import { FinancialPageView } from '../components/FinancialPageView';
import { FinancialDataTable } from '../components/FinancialDataTable';
import { FinancialOrderPaymentsReportView } from '../views/FinancialOrderPaymentsReportView';
import { FINANCIAL_HUB_BY_ID } from '../constants/hubs';
import { useFinancialPage } from '../hooks/useFinancialPage';

type Props = { isDark: boolean };

export function FinancialSalesHubView({ isDark }: Props) {
  const hub = FINANCIAL_HUB_BY_ID.sales;
  const basePath = useTenantBasePath();
  const { loading, data } = useFinancialPage('receivables');

  const customerRows = useMemo(() => {
    if (!data?.tables[0]?.rows) return [];
    return data.tables[0].rows.map((row) => ({
      ...row,
      actions: row.customerId ? (
        <Button
          component={Link}
          href={buildTenantHref(basePath, `/financial/sales/customers/${row.customerId}`)}
          size="small"
          variant="outlined"
        >
          پروفایل مالی
        </Button>
      ) : null,
    }));
  }, [data, basePath]);

  return (
    <FinancialHubShell
      hub={hub}
      isDark={isDark}
      renderTab={(tabId) => {
        if (tabId === 'customers') {
          if (loading && !data) {
            return (
              <Stack alignItems="center" py={6}>
                <CircularProgress />
              </Stack>
            );
          }
          const table = data?.tables[0];
          return (
            <Stack spacing={2}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                برای دیدن پیش‌فاکتور، فاکتور، مانده و چک هر مشتری، روی «پروفایل مالی» کلیک کنید.
              </Alert>
              {table ? (
                <FinancialDataTable
                  title="لیست مشتریان — مانده حساب"
                  columns={[
                    ...table.columns,
                    { id: 'actions', label: '', align: 'center' as const, minWidth: 140 },
                  ]}
                  rows={customerRows}
                  isDark={isDark}
                />
              ) : null}
            </Stack>
          );
        }
        if (tabId === 'payments') {
          return <FinancialOrderPaymentsReportView isDark={isDark} />;
        }
        const tab = hub.tabs.find((t) => t.id === tabId);
        if (tab?.pageId) {
          return <FinancialPageView pageId={tab.pageId} isDark={isDark} variant="hub" />;
        }
        return null;
      }}
    />
  );
}
