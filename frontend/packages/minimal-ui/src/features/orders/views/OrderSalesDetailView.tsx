'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { ordersSalesApi } from '../api/ordersSalesApi';
import { OrderWorkflowDialog } from '../components/OrderWorkflowDialog';
import { OrderDetailBadge, OrderDetailInfoCard, OrderDetailRow } from '../components/OrderDetailInfoCard';
import { ORDER_WORKFLOW_LABELS, resolveWorkflowStage } from '../constants/order-workflow';
import { applicationTypeLabel } from '../constants/concrete-application-types';
import { concreteTypeLabel } from '../constants/concrete-types';
import { pumpTypeLabel } from '../constants/pump-types';
import { OrderSalesDetail } from '../types/sales';
import { displayDate, displayM3, displayMoney } from '../utils/display';

const ORANGE = '#EA580C';
const YELLOW = '#EAB308';

type Props = { orderId: string; isDark?: boolean };

function formatOrderTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

function customerFullName(detail: OrderSalesDetail): string {
  const c = detail.order.customer as { title?: string; name?: string; lastname?: string } | undefined;
  if (c) {
    const full = [c.title, c.name, c.lastname].filter(Boolean).join(' ').trim();
    if (full) return full;
  }
  return detail.order.customerName || 'ثبت نشده';
}

function resolvePaymentStatus(detail: OrderSalesDetail): { label: string; tone: 'orange' | 'yellow' | 'green' } {
  const paid = Number(detail.order.paidAmountComputed ?? detail.order.paidAmount ?? 0);
  const total = Number(detail.order.totalAmount ?? 0);
  const prepayRequired = detail.order.prepaymentRequired;
  const prepayAmount = Number(detail.order.prepaymentAmount ?? 0);

  if (total > 0 && paid >= total) {
    return { label: 'پرداخت شده', tone: 'green' };
  }
  if (prepayRequired && paid < prepayAmount) {
    return { label: 'در انتظار پیش‌پرداخت', tone: 'orange' };
  }
  if (paid > 0) {
    return { label: 'پرداخت جزئی', tone: 'yellow' };
  }
  return { label: 'در انتظار پرداخت', tone: 'orange' };
}

function resolveInvoiceAmount(detail: OrderSalesDetail): string {
  const total = Number(detail.order.totalAmount ?? 0);
  if (total <= 0) return 'محاسبه نشده';
  return displayMoney(total);
}

export function OrderSalesDetailView({ orderId, isDark }: Props) {
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrderSalesDetail | null>(null);
  const [workflowOpen, setWorkflowOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await ordersSalesApi.getDetail(orderId));
    } catch {
      toast.error('خطا در بارگذاری سفارش');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const paymentStatus = useMemo(() => (data ? resolvePaymentStatus(data) : null), [data]);

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!data) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">سفارش یافت نشد یا بارگذاری ناموفق بود.</Alert>
        <Button
          component={Link}
          href={buildTenantHref(basePath, '/orders/list')}
          variant="outlined"
          startIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
        >
          بازگشت به لیست سفارشات
        </Button>
      </Stack>
    );
  }

  const o = data.order;
  const workflowStage = resolveWorkflowStage(o.workflowStage);
  const workflowLabel = ORDER_WORKFLOW_LABELS[workflowStage];

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
        spacing={2}
      >
        <Breadcrumbs
          separator={<Iconify icon="eva:chevron-left-fill" width={14} sx={{ opacity: 0.5 }} />}
          sx={{ fontSize: 13, color: 'text.secondary' }}
        >
          <Link href={buildTenantHref(basePath, '/dashboard')} style={{ color: 'inherit', display: 'flex' }}>
            <Iconify icon="solar:home-2-bold-duotone" width={16} />
          </Link>
          <Link href={buildTenantHref(basePath, '/orders/list')} style={{ color: 'inherit' }}>
            مدیریت سفارشات
          </Link>
        </Breadcrumbs>

        <Box sx={{ textAlign: { xs: 'right', md: 'left' } }}>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: 22, md: 26 }, color: 'text.primary' }}>
            مشاهده جزئیات سفارش
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5 }}>جزئیات سفارش</Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'center' }}
        spacing={2}
      >
        <Stack spacing={1.25} sx={{ maxWidth: 280 }}>
          <Button
            component={Link}
            href={buildTenantHref(basePath, '/orders/list')}
            variant="contained"
            startIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
            sx={{
              bgcolor: YELLOW,
              color: '#1e293b',
              fontWeight: 800,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#CA8A04', boxShadow: 'none' },
            }}
          >
            بازگشت به لیست سفارشات
          </Button>
          <Button
            variant="contained"
            onClick={() => setWorkflowOpen(true)}
            sx={{
              bgcolor: ORANGE,
              fontWeight: 800,
              borderRadius: 999,
              py: 1.1,
              boxShadow: `0 10px 24px ${ORANGE}40`,
              '&:hover': { bgcolor: '#C2410C' },
            }}
          >
            {workflowLabel}
          </Button>
          {o.concreteGrade ? (
            <Button
              component={Link}
              href={buildTenantHref(basePath, `/concrete-mix/builder?orderId=${o.id}`)}
              variant="outlined"
              startIcon={<Iconify icon="solar:test-tube-bold-duotone" width={18} />}
              sx={{
                borderColor: ORANGE,
                color: ORANGE,
                fontWeight: 800,
                borderRadius: 999,
                py: 1.1,
              }}
            >
              دریافت طرح اختلاط
            </Button>
          ) : null}
        </Stack>

        <Box sx={{ textAlign: { xs: 'right', lg: 'left' } }}>
          <Typography sx={{ fontWeight: 900, fontSize: 20 }}>سفارش #{o.orderNumber}</Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5 }}>
            ثبت شده در تاریخ {displayDate(o.orderDate)} — ساعت {formatOrderTime(o.orderDate)}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <OrderDetailInfoCard title="اطلاعات کاربر" icon="solar:user-bold-duotone">
            <OrderDetailRow label="نام و نام خانوادگی" value={customerFullName(data)} />
            <OrderDetailRow
              label="شماره موبایل"
              value={o.customer?.mobile || '—'}
            />
          </OrderDetailInfoCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <OrderDetailInfoCard title="اطلاعات اصلی سفارش" icon="solar:info-circle-bold-duotone">
            <OrderDetailRow label="شناسه سفارش" value={<Typography sx={{ fontFamily: 'monospace', fontSize: 13 }}>{o.id}</Typography>} />
            <OrderDetailRow label="شماره سفارش" value={o.orderNumber} />
            <OrderDetailRow
              label="وضعیت سفارش"
              value={<OrderDetailBadge label={workflowLabel} tone="orange" />}
            />
            <OrderDetailRow
              label="وضعیت پرداخت"
              value={paymentStatus ? <OrderDetailBadge label={paymentStatus.label} tone={paymentStatus.tone} /> : '—'}
            />
            <OrderDetailRow label="مبلغ کل فاکتور" value={resolveInvoiceAmount(data)} />
            <OrderDetailRow label="تاریخ ثبت" value={displayDate(o.orderDate)} />
            <OrderDetailRow label="ساعت ثبت" value={formatOrderTime(o.orderDate)} />
            <OrderDetailRow label="نام پروژه" value={o.title?.trim() || o.destinationTitle || '—'} />
          </OrderDetailInfoCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <OrderDetailInfoCard title="اطلاعات محصول" icon="solar:box-bold-duotone">
            <OrderDetailRow label="نوع محصول" value={applicationTypeLabel(o.applicationType)} />
            <OrderDetailRow label="مقدار" value={displayM3(o.volumeM3)} />
            <OrderDetailRow
              label="نیاز به پمپ"
              value={
                o.pumpType ? (
                  <OrderDetailBadge label={pumpTypeLabel(o.pumpType)} tone="yellow" />
                ) : (
                  '—'
                )
              }
            />
            <OrderDetailRow
              label="کاربرد"
              value={applicationTypeLabel(o.applicationType)}
            />
            <OrderDetailRow label="نوع بتن" value={concreteTypeLabel(o.concreteType)} />
            <OrderDetailRow
              label="رده مقاومتی"
              value={o.concreteGrade ? o.concreteGrade.replace(/^C/i, '') : '—'}
            />
            <OrderDetailRow label="اسلامپ" value={o.slumpMm != null ? `${o.slumpMm} سانتی‌متر` : '—'} />
            {o.specifications?.trim() ? (
              <OrderDetailRow label="مشخصات" value={o.specifications} />
            ) : null}
            <OrderDetailRow label="مقصد" value={o.destinationTitle || o.destinationAddress || '—'} />
          </OrderDetailInfoCard>
        </Grid>
      </Grid>

      {(data.payments.length > 0 || data.alerts.length > 0) && (
        <Stack spacing={1.5}>
          {data.payments.length > 0 && (
            <Box>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>پرداخت‌ها</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {data.payments.map((p) => (
                  <Chip key={p.id} label={`${displayMoney(p.amount)} — ${p.status}`} size="small" />
                ))}
              </Stack>
            </Box>
          )}
          {data.alerts.map((a) => (
            <Alert key={a.id} severity={a.severity === 'CRITICAL' ? 'error' : 'warning'}>
              <strong>{a.title}</strong> — {a.description}
            </Alert>
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          component={Link}
          href={buildTenantHref(basePath, `/orders/${orderId}/edit`)}
          variant="outlined"
        >
          ویرایش سفارش
        </Button>
        {o.financialApprovalRequired && !o.financialApprovedAt && (
          <Button
            variant="contained"
            onClick={async () => {
              await ordersSalesApi.financialApprove(orderId);
              toast.success('تأیید مالی ثبت شد');
              load();
            }}
          >
            تأیید مالی
          </Button>
        )}
      </Stack>

      <OrderWorkflowDialog
        open={workflowOpen}
        order={o}
        onClose={() => setWorkflowOpen(false)}
        onSaved={load}
      />
    </Stack>
  );
}
