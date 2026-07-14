'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'minimal-shared/hooks';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { TenantInfoAlert } from '@/features/tenant-panel/components/TenantInfoAlert';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { MATERIALS_INVENTORY_SCOPE } from '../constants';

import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { StockBalance } from '@/features/inventory/types';
import { StockLedgerFormDialog } from '@/features/stock-ledger/components/StockLedgerFormDialog';
import { stockLedgerApi } from '@/features/stock-ledger/api/stockLedgerApi';
import { StockLedger } from '@/features/stock-ledger/types';

type Props = { isDark: boolean };

export function MaterialsInventoryView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const ledgerDialog = useBoolean();
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [ledger, setLedger] = useState<StockLedger[]>([]);

  const load = async () => {
    const [balanceRows, ledgerRows] = await Promise.all([
      inventoryApi.getBalances(),
      stockLedgerApi.getAll({ page: 1, limit: 30 }),
    ]);
    setBalances(balanceRows);
    setLedger(ledgerRows.data || []);
  };

  useEffect(() => {
    load().catch((error) => notifyApiError(error, 'خطا در دریافت اطلاعات انبار'));
  }, []);

  return (
    <Stack spacing={3}>
      <TenantSubPageHeader
        title="انبارگردانی تولید"
        subtitle={MATERIALS_INVENTORY_SCOPE}
        isDark={isDark}
        action={
          <Button variant="contained" onClick={ledgerDialog.onTrue}>
            ثبت گردش انبار
          </Button>
        }
      />

      <TenantInfoAlert>
        برای <strong>ورود انبار</strong> قیمت خرید واحد الزامی است. فاکتور رسمی خرید با آپلود فایل
        را در{' '}
        <Link href={buildTenantHref(basePath, '/materials/invoices')}>
          فاکتورهای ورود
        </Link>{' '}
        ثبت کنید — همان فاکتور در بخش مالی نیز نمایش داده می‌شود. خروج دستی برای تعدیل موجودی
        در دسترس است؛ مصرف تولید از سفارش‌های «اتمام تولید» خودکار ثبت می‌شود.
      </TenantInfoAlert>

      <Card sx={{ p: 2, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>مانده موجودی</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ماده</TableCell>
              <TableCell>مانده</TableCell>
              <TableCell>وضعیت</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.map((row) => (
              <TableRow key={row.rawMaterialId}>
                <TableCell>{row.rawMaterial?.name || row.rawMaterialId}</TableCell>
                <TableCell>{row.balance}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={row.isLowStock ? 'warning' : 'success'}
                    label={row.isLowStock ? 'کم‌موجودی' : 'عادی'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card sx={{ p: 2, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>آخرین گردش‌های انبار</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ماده</TableCell>
              <TableCell>نوع</TableCell>
              <TableCell>مقدار</TableCell>
              <TableCell>قیمت واحد</TableCell>
              <TableCell>منبع</TableCell>
              <TableCell>تاریخ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ledger.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.rawMaterial?.name || entry.rawMaterialId}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={entry.type === 'IN' ? 'success' : 'warning'}
                    label={entry.type === 'IN' ? 'ورود' : 'خروج'}
                  />
                </TableCell>
                <TableCell>{entry.quantity}</TableCell>
                <TableCell>
                  {entry.unitPrice != null ? Number(entry.unitPrice).toLocaleString('fa-IR') : '—'}
                </TableCell>
                <TableCell>
                  {entry.source === 'purchase_invoice'
                    ? 'فاکتور ورود'
                    : entry.type === 'OUT'
                      ? 'تولید'
                      : 'انبارگردانی'}
                </TableCell>
                <TableCell>{new Date(entry.occurredAt).toLocaleDateString('fa-IR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <StockLedgerFormDialog
        open={ledgerDialog.value}
        onClose={ledgerDialog.onFalse}
        onSuccess={() => {
          ledgerDialog.onFalse();
          load();
        }}
      />
    </Stack>
  );
}
