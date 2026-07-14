'use client';

import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { financialDashboardApi } from '../api/financialDashboardApi';
import { FinancialHubShell } from '../components/FinancialHubShell';
import { FinancialPageView } from '../components/FinancialPageView';
import { FinancialDataTable } from '../components/FinancialDataTable';
import { FINANCIAL_HUB_BY_ID } from '../constants/hubs';
import {
  FinancialAssetDepreciation,
  FinancialNonOperatingEntry,
} from '../types/advanced';

type Props = { isDark: boolean };

function AdvancedEntryPanel({
  title,
  isDark,
  loading,
  columns,
  rows,
  formFields,
  onSubmit,
}: {
  title: string;
  isDark: boolean;
  loading: boolean;
  columns: Array<{ id: string; label: string; align?: 'left' | 'right' | 'center' }>;
  rows: Record<string, string | number>[];
  formFields: React.ReactNode;
  onSubmit: () => void;
}) {
  return (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
      {formFields}
      <Button variant="contained" onClick={onSubmit} disabled={loading}>
        ثبت
      </Button>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <FinancialDataTable title={title} columns={columns} rows={rows} isDark={isDark} />
      )}
    </Stack>
  );
}

export function FinancialAdvancedView({ isDark }: Props) {
  const hub = FINANCIAL_HUB_BY_ID.advanced;
  const [loading, setLoading] = useState(true);
  const [depreciation, setDepreciation] = useState<FinancialAssetDepreciation[]>([]);
  const [nonOperating, setNonOperating] = useState<FinancialNonOperatingEntry[]>([]);
  const [assetName, setAssetName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [bookValue, setBookValue] = useState('');
  const [entryType, setEntryType] = useState<'interest' | 'fine' | 'asset_loss' | 'other'>('interest');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNote, setEntryNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dep, nonOp] = await Promise.all([
        financialDashboardApi.listDepreciation(),
        financialDashboardApi.listNonOperating(),
      ]);
      setDepreciation(dep);
      setNonOperating(nonOp);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addDepreciation = async () => {
    await financialDashboardApi.createDepreciation({
      assetName,
      monthlyAmount: Number(monthlyAmount),
      bookValue: Number(bookValue),
      startDate: new Date().toISOString().slice(0, 10),
    });
    setAssetName('');
    setMonthlyAmount('');
    setBookValue('');
    await load();
  };

  const addNonOperating = async () => {
    await financialDashboardApi.createNonOperating({
      type: entryType,
      amount: Number(entryAmount),
      entryDate: new Date().toISOString().slice(0, 10),
      note: entryNote,
    });
    setEntryAmount('');
    setEntryNote('');
    await load();
  };

  return (
    <FinancialHubShell
      hub={hub}
      isDark={isDark}
      renderTab={(tabId) => {
        if (tabId === 'depreciation') {
          return (
            <AdvancedEntryPanel
              title="استهلاک تجهیزات و دارایی‌ها"
              isDark={isDark}
              loading={loading}
              columns={[
                { id: 'asset', label: 'دارایی' },
                { id: 'monthly', label: 'استهلاک ماهانه', align: 'right' },
                { id: 'book', label: 'ارزش دفتری', align: 'right' },
                { id: 'start', label: 'شروع', align: 'center' },
              ]}
              rows={depreciation.map((d) => ({
                asset: d.assetName,
                monthly: d.monthlyAmount.toLocaleString('fa-IR'),
                book: d.bookValue.toLocaleString('fa-IR'),
                start: d.startDate,
              }))}
              formFields={
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField label="نام دارایی" value={assetName} onChange={(e) => setAssetName(e.target.value)} size="small" />
                  <TextField label="استهلاک ماهانه" type="number" value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value)} size="small" />
                  <TextField label="ارزش دفتری" type="number" value={bookValue} onChange={(e) => setBookValue(e.target.value)} size="small" />
                </Stack>
              }
              onSubmit={addDepreciation}
            />
          );
        }
        if (tabId === 'non-operating') {
          return (
            <AdvancedEntryPanel
              title="هزینه‌های غیرعملیاتی"
              isDark={isDark}
              loading={loading}
              columns={[
                { id: 'type', label: 'نوع' },
                { id: 'amount', label: 'مبلغ', align: 'right' },
                { id: 'date', label: 'تاریخ', align: 'center' },
                { id: 'note', label: 'توضیح' },
              ]}
              rows={nonOperating.map((e) => ({
                type:
                  e.type === 'interest'
                    ? 'بهره وام'
                    : e.type === 'fine'
                      ? 'جرائم'
                      : e.type === 'asset_loss'
                        ? 'زیان فروش دارایی'
                        : 'سایر',
                amount: e.amount.toLocaleString('fa-IR'),
                date: e.entryDate,
                note: e.note ?? '—',
              }))}
              formFields={
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    select
                    label="نوع"
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as typeof entryType)}
                    size="small"
                    SelectProps={{ native: true }}
                  >
                    <option value="interest">بهره وام</option>
                    <option value="fine">جرائم</option>
                    <option value="asset_loss">زیان فروش دارایی</option>
                    <option value="other">سایر</option>
                  </TextField>
                  <TextField label="مبلغ" type="number" value={entryAmount} onChange={(e) => setEntryAmount(e.target.value)} size="small" />
                  <TextField label="توضیح" value={entryNote} onChange={(e) => setEntryNote(e.target.value)} size="small" />
                </Stack>
              }
              onSubmit={addNonOperating}
            />
          );
        }
        const tab = hub.tabs.find((t) => t.id === tabId);
        if (tab?.pageId) {
          return <FinancialPageView pageId={tab.pageId} isDark={isDark} variant="hub" />;
        }
        return (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            این بخش از حسابداری ارشد در حال تکمیل است.
          </Alert>
        );
      }}
    />
  );
}
