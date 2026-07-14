'use client';

import { useCallback, useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
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
import {
  materialInvoiceFileUrl,
  materialPurchaseInvoicesApi,
} from '@/features/material-purchase-invoices/api/materialPurchaseInvoicesApi';
import { MaterialPurchaseInvoiceFormDialog } from '@/features/material-purchase-invoices/components/MaterialPurchaseInvoiceFormDialog';
import { MaterialPurchaseInvoice } from '@/features/material-purchase-invoices/types';

type Props = { isDark: boolean };

export function MaterialsPurchaseInvoicesView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const dialog = useBoolean();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MaterialPurchaseInvoice[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await materialPurchaseInvoicesApi.getAll({ page: 1, limit: 50 });
      setRows(res.data || []);
    } catch (error) {
      notifyApiError(error, 'خطا در دریافت فاکتورها');
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
        title="فاکتورهای ورود مواد"
        subtitle="ثبت فاکتور خرید، آپلود تصویر/PDF و توضیحات حسابداری — هر فاکتور در بخش مالی نیز نمایش داده می‌شود."
        isDark={isDark}
        action={
          <Button variant="contained" onClick={dialog.onTrue}>
            ثبت فاکتور ورود
          </Button>
        }
      />

      <TenantInfoAlert>
        برای تعدیل سریع موجودی بدون فاکتور رسمی از{' '}
        <Link href={buildTenantHref(basePath, '/materials/inventory')}>
          انبارگردانی تولید
        </Link>{' '}
        استفاده کنید (با قیمت خرید). فاکتورهای رسمی خرید را اینجا ثبت کنید.
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
                <TableCell>شماره</TableCell>
                <TableCell>تأمین‌کننده</TableCell>
                <TableCell>تاریخ</TableCell>
                <TableCell>جمع (ریال)</TableCell>
                <TableCell>اقلام</TableCell>
                <TableCell>فایل</TableCell>
                <TableCell>توضیح</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography sx={{ py: 3, opacity: 0.7 }}>فاکتوری ثبت نشده</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoiceNumber || '—'}</TableCell>
                    <TableCell>{inv.party}</TableCell>
                    <TableCell>{new Date(inv.invoiceDate).toLocaleDateString('fa-IR')}</TableCell>
                    <TableCell>{Number(inv.totalAmount).toLocaleString('fa-IR')}</TableCell>
                    <TableCell>
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {inv.lines?.map((line) => (
                          <Chip
                            key={line.id}
                            size="small"
                            label={`${line.rawMaterial?.name || 'ماده'} × ${line.quantity}`}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {inv.fileName ? (
                        <Link href={materialInvoiceFileUrl(inv.fileName) || '#'} target="_blank" rel="noopener">
                          {inv.originalFileName || 'دانلود'}
                        </Link>
                      ) : (
                        '—'
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

      <MaterialPurchaseInvoiceFormDialog
        open={dialog.value}
        onClose={dialog.onFalse}
        onSuccess={() => {
          dialog.onFalse();
          load();
        }}
      />
    </Stack>
  );
}
