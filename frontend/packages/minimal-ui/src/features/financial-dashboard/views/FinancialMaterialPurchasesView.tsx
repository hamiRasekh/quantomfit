'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { TenantInfoAlert } from '@/features/tenant-panel/components/TenantInfoAlert';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import {
  materialInvoiceFileUrl,
  materialPurchaseInvoicesApi,
} from '@/features/material-purchase-invoices/api/materialPurchaseInvoicesApi';
import { MaterialPurchaseInvoice } from '@/features/material-purchase-invoices/types';

type Props = { isDark: boolean };

export function FinancialMaterialPurchasesView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MaterialPurchaseInvoice[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await materialPurchaseInvoicesApi.getAll({ page: 1, limit: 100 });
      setRows(res.data || []);
    } catch (error) {
      notifyApiError(error, 'خطا در دریافت فاکتورهای ورود مواد');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="فاکتور ورود مواد تولید"
        subtitle="مرجع حسابداری خرید مصالح تولید — هر فاکتور از بخش مواد اولیه ثبت می‌شود."
        isDark={isDark}
        action={
          <Button
            component={Link}
            href={buildTenantHref(basePath, '/materials/invoices')}
            variant="contained"
          >
            ثبت فاکتور جدید
          </Button>
        }
      />

      <TenantInfoAlert>
        این بخش فقط نمایش مالی فاکتورهای ثبت‌شده در{' '}
        <MuiLink component={Link} href={buildTenantHref(basePath, '/materials/invoices')}>
          مواد اولیه → فاکتورهای ورود
        </MuiLink>{' '}
        است. خریدهای جانبی شرکت در «هزینه‌های جانبی شرکت» ثبت می‌شوند.
      </TenantInfoAlert>

      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : (
        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>شماره فاکتور</TableCell>
                <TableCell>تأمین‌کننده</TableCell>
                <TableCell>تاریخ</TableCell>
                <TableCell>جمع (ریال)</TableCell>
                <TableCell>اقلام</TableCell>
                <TableCell>پیوست</TableCell>
                <TableCell>توضیح حسابداری</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography sx={{ py: 3, opacity: 0.7 }}>
                      فاکتوری ثبت نشده — از بخش مواد اولیه فاکتور ورود ثبت کنید
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoiceNumber || '—'}</TableCell>
                    <TableCell>{inv.party}</TableCell>
                    <TableCell>{new Date(inv.invoiceDate).toLocaleDateString('fa-IR')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {Number(inv.totalAmount).toLocaleString('fa-IR')}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {inv.lines?.map((line) => (
                          <Typography key={line.id} sx={{ fontSize: 12 }}>
                            {line.rawMaterial?.name}: {line.quantity} ×{' '}
                            {Number(line.unitPrice || 0).toLocaleString('fa-IR')} ریال
                          </Typography>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {inv.fileName ? (
                        <MuiLink href={materialInvoiceFileUrl(inv.fileName) || '#'} target="_blank" rel="noopener">
                          {inv.originalFileName || 'فایل فاکتور'}
                        </MuiLink>
                      ) : (
                        <Chip size="small" label="بدون فایل" />
                      )}
                    </TableCell>
                    <TableCell>{inv.description || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </Stack>
  );
}
