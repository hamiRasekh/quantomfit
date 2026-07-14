'use client';

import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { customersApi } from '@/features/customers/api/customersApi';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

import { financialDashboardApi } from '../api/financialDashboardApi';
import { FinancialDataTable } from '../components/FinancialDataTable';
import { FinancialOrderPaymentsReportView } from './FinancialOrderPaymentsReportView';
import { FinancialPagePayload } from '../types';

type Props = {
  customerId: string;
  isDark: boolean;
};

const PROFILE_TABS = [
  { id: 'summary', label: 'خلاصه' },
  { id: 'quotes', label: 'پیش‌فاکتور' },
  { id: 'invoices', label: 'فاکتورها' },
  { id: 'balance', label: 'مانده' },
  { id: 'checks', label: 'چک‌ها' },
  { id: 'payments', label: 'واریزی‌ها' },
] as const;

export function CustomerFinancialProfileView({ customerId, isDark }: Props) {
  const { financialCurrencyUnit, colors } = useTenantPageTheme();
  const [tab, setTab] = useState<(typeof PROFILE_TABS)[number]['id']>('summary');
  const [customerName, setCustomerName] = useState('مشتری');
  const [loading, setLoading] = useState(true);
  const [receivablesPage, setReceivablesPage] = useState<FinancialPagePayload | null>(null);
  const [contractsPage, setContractsPage] = useState<FinancialPagePayload | null>(null);
  const [invoicesPage, setInvoicesPage] = useState<FinancialPagePayload | null>(null);

  const filters = useMemo(() => ({ customerId }), [customerId]);

  useEffect(() => {
    customersApi
      .getById(customerId)
      .then((c) => setCustomerName(`${c.name ?? ''} ${c.lastname ?? ''}`.trim() || c.title || 'مشتری'))
      .catch(() => undefined);
  }, [customerId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      financialDashboardApi.getPage('receivables', filters, financialCurrencyUnit),
      financialDashboardApi.getPage('contracts', filters, financialCurrencyUnit),
      financialDashboardApi.getPage('invoices', filters, financialCurrencyUnit),
    ])
      .then(([receivables, contracts, invoices]) => {
        setReceivablesPage(receivables);
        setContractsPage(contracts);
        setInvoicesPage(invoices);
      })
      .finally(() => setLoading(false));
  }, [customerId, filters, financialCurrencyUnit]);

  const receivableRow = receivablesPage?.tables[0]?.rows[0];
  const text = isDark ? '#EAF2FF' : '#04044A';

  if (loading && !receivablesPage) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title={`پروفایل مالی — ${customerName}`}
        subtitle="پیش‌فاکتور، فاکتور، مانده حساب و وصولی‌ها در یک صفحه"
        isDark={isDark}
      />

      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable">
        {PROFILE_TABS.map((item) => (
          <Tab key={item.id} value={item.id} label={item.label} />
        ))}
      </Tabs>

      {tab === 'summary' && receivablesPage ? (
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Typography sx={{ color: text }}>
              مانده کل:{' '}
              <strong>{receivableRow?.total ? String(receivableRow.total) : '—'}</strong>
            </Typography>
            <Typography sx={{ color: text }}>
              سررسید گذشته: <strong>{receivableRow?.overdue ? String(receivableRow.overdue) : '—'}</strong>
            </Typography>
            <Typography sx={{ color: text }}>
              DSO: <strong>{receivableRow?.dso ? String(receivableRow.dso) : '—'}</strong>
            </Typography>
          </Stack>
          {receivablesPage.tables[0] ? (
            <FinancialDataTable
              title="خلاصه مطالبات"
              columns={receivablesPage.tables[0].columns}
              rows={receivablesPage.tables[0].rows}
              isDark={isDark}
            />
          ) : null}
        </Stack>
      ) : null}

      {tab === 'quotes' && contractsPage?.tables[0] ? (
        <FinancialDataTable
          title="پیش‌فاکتورها و قراردادها"
          columns={contractsPage.tables[0].columns}
          rows={
            contractsPage.tables[0].rows.filter((r) => String(r.type).includes('پیش')).length
              ? contractsPage.tables[0].rows.filter((r) => String(r.type).includes('پیش'))
              : contractsPage.tables[0].rows
          }
          isDark={isDark}
        />
      ) : null}

      {tab === 'invoices' && invoicesPage?.tables[0] ? (
        <FinancialDataTable
          title="فاکتورها و مغایرت"
          columns={invoicesPage.tables[0].columns}
          rows={invoicesPage.tables[0].rows}
          isDark={isDark}
        />
      ) : null}

      {tab === 'balance' && receivablesPage?.tables[0] ? (
        <FinancialDataTable
          title="مانده و سررسید"
          columns={receivablesPage.tables[0].columns}
          rows={receivablesPage.tables[0].rows}
          isDark={isDark}
        />
      ) : null}

      {tab === 'checks' ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          چک‌های دریافتی این مشتری پس از ثبت entity چک در سیستم، در این تب نمایش داده می‌شود. فعلاً از
          فیلد checksPending در مطالبات استفاده کنید.
        </Alert>
      ) : null}

      {tab === 'payments' ? (
        <FinancialOrderPaymentsReportView isDark={isDark} customerId={customerId} />
      ) : null}
    </Stack>
  );
}
