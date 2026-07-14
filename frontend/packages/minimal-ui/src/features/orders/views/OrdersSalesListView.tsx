'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { ordersApi } from '../api/ordersApi';
import { ordersSalesApi } from '../api/ordersSalesApi';
import { ORDER_WORKFLOW_LABELS, resolveWorkflowStage } from '../constants/order-workflow';
import { OrderDeliveryDateDialog } from '../components/OrderDeliveryDateDialog';
import { OrderWorkflowDialog } from '../components/OrderWorkflowDialog';
import { OrderWorkflowProgress } from '../components/OrderWorkflowProgress';
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '../types';
import { OrderSalesStatusBadge } from '../components/OrderSalesStatusBadge';
import { displayDate, displayDateTime, displayMoney } from '../utils/display';

const WORKFLOW_ORANGE = '#EA580C';

type Props = { isDark: boolean };

export function OrdersSalesListView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [workflowOrder, setWorkflowOrder] = useState<Order | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleFinancialApprove = async (orderId: string) => {
    setApprovingId(orderId);
    try {
      await ordersSalesApi.financialApprove(orderId);
      toast.success('تأیید مالی ثبت شد');
      loadOrders();
    } catch {
      toast.error('خطا در تأیید مالی');
    } finally {
      setApprovingId(null);
    }
  };

  const loadOrders = useCallback(() => {
    setLoading(true);
    ordersApi
      .getAll({ page: 1, limit: 100, status: (status as OrderStatus) || undefined })
      .then((r) => setOrders(r.data || []))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader
        title="لیست سفارشات"
        isDark={isDark}
        action={
          <Button component={Link} href={buildTenantHref(basePath, '/orders/new')} variant="contained">
            سفارش جدید
          </Button>
        }
      />

      <TextField select size="small" label="وضعیت" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ maxWidth: 200 }}>
        <MenuItem value="">همه</MenuItem>
        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
          <MenuItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</MenuItem>
        ))}
      </TextField>

      {loading ? (
        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
      ) : orders.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>سفارشی یافت نشد</Typography>
      ) : (
        orders.map((o) => {
          const workflowStage = resolveWorkflowStage(o.workflowStage);
          return (
            <Card key={o.id} sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2}>
                <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography sx={{ fontWeight: 900 }}>{o.orderNumber}</Typography>
                    <OrderSalesStatusBadge status={o.status} />
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: `${WORKFLOW_ORANGE}14`,
                        color: WORKFLOW_ORANGE,
                      }}
                    >
                      {ORDER_WORKFLOW_LABELS[workflowStage]}
                    </Box>
                  </Stack>
                  <Typography sx={{ fontSize: 13, opacity: 0.75 }}>
                    {o.customerName || o.customer?.name || '—'} | ثبت: {displayDate(o.orderDate)}
                  </Typography>
                  <Typography sx={{ fontSize: 13, opacity: 0.75 }}>
                    تحویل: {o.deliveryDate ? displayDateTime(o.deliveryDate) : 'تعیین نشده'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, opacity: 0.65 }}>{displayMoney(o.totalAmount)}</Typography>
                  <OrderWorkflowProgress stage={workflowStage} compact />
                  {o.financialApprovalRequired && !o.financialApprovedAt && (
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ pt: 0.5 }}>
                      <Chip label="در انتظار تأیید قیمت" size="small" color="warning" variant="outlined" />
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        disabled={approvingId === o.id}
                        onClick={() => handleFinancialApprove(o.id)}
                        startIcon={
                          approvingId === o.id ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <Iconify icon="solar:wallet-check-bold" width={18} />
                          )
                        }
                      >
                        تأیید مالی
                      </Button>
                    </Stack>
                  )}
                </Stack>

                <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" justifyContent="flex-end">
                  {o.concreteGrade ? (
                    <Button
                      component={Link}
                      href={buildTenantHref(basePath, `/concrete-mix/builder?orderId=${o.id}`)}
                      variant="contained"
                      size="small"
                      color="secondary"
                      startIcon={<Iconify icon="solar:test-tube-bold-duotone" width={18} />}
                    >
                      طرح اختلاط
                    </Button>
                  ) : null}
                  <Button
                    component={Link}
                    href={buildTenantHref(basePath, `/orders/${o.id}/edit`)}
                    variant="contained"
                    size="small"
                  >
                    ویرایش سفارش
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => setEditingOrder(o)}>
                    {o.deliveryDate ? 'ویرایش تحویل' : 'تعیین تحویل'}
                  </Button>
                  <Tooltip title="مشاهده جزئیات سفارش">
                    <IconButton
                      component={Link}
                      href={buildTenantHref(basePath, `/orders/${o.id}`)}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover', color: 'primary.main' },
                      }}
                    >
                      <Iconify icon="solar:eye-bold" width={22} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="فرآیند و تغییر وضعیت">
                    <IconButton
                      onClick={() => setWorkflowOrder(o)}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: `${WORKFLOW_ORANGE}14`,
                        color: WORKFLOW_ORANGE,
                        border: '1px solid',
                        borderColor: `${WORKFLOW_ORANGE}55`,
                        '&:hover': { bgcolor: `${WORKFLOW_ORANGE}24` },
                      }}
                    >
                      <Iconify icon="solar:restart-bold" width={22} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Card>
          );
        })
      )}

      <OrderDeliveryDateDialog
        open={!!editingOrder}
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onSaved={loadOrders}
      />

      <OrderWorkflowDialog
        open={!!workflowOrder}
        order={workflowOrder}
        onClose={() => setWorkflowOrder(null)}
        onSaved={loadOrders}
      />
    </Stack>
  );
}
