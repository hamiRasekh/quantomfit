'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { OrderWorkflowProgress } from '@/features/orders/components/OrderWorkflowProgress';
import { OrderSalesStatusBadge } from '@/features/orders/components/OrderSalesStatusBadge';
import {
  ORDER_WORKFLOW_LABELS,
  ORDER_WORKFLOW_STEPS,
  resolveWorkflowStage,
  workflowStageIndex,
} from '@/features/orders/constants/order-workflow';
import { Order, OrderWorkflowStage } from '@/features/orders/types';
import {
  filterUnfinishedOrders,
  getPipelineOrders,
} from '@/features/orders/utils/order-pipeline';
import { orderProjectName } from '@/features/orders/utils/order-payments';
import { displayDateTime } from '@/features/orders/utils/display';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import {
  TENANT_LIGHT,
  TENANT_SHELL,
  tenantGlassHoverLiftSx,
  tenantGlassSurfaceSx,
} from '@/shared/theme/tenant-shell-theme';

const WORKFLOW_ACCENT = TENANT_SHELL.brandRed;

type Props = {
  orders: Order[];
  loading: boolean;
  basePath: string;
  isDark: boolean;
  accent: string;
};

function StageSummary({ stage }: { stage: OrderWorkflowStage }) {
  const step = ORDER_WORKFLOW_STEPS[workflowStageIndex(stage)];
  return (
    <Typography sx={{ fontSize: 12.5, lineHeight: 1.65, opacity: 0.72 }}>
      {step?.description}
    </Typography>
  );
}

function OrderPipelineCard({
  order,
  basePath,
  isDark,
  accent,
}: {
  order: Order;
  basePath: string;
  isDark: boolean;
  accent: string;
}) {
  const workflowStage = resolveWorkflowStage(order.workflowStage);
  const step = ORDER_WORKFLOW_STEPS[workflowStageIndex(workflowStage)];
  const text = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;
  const muted = isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted;
  const project = orderProjectName(order);

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        color: text,
        ...tenantGlassSurfaceSx(isDark, { accentColor: accent, borderRadius: 3 }),
        ...tenantGlassHoverLiftSx(accent, isDark),
      }}
    >
      <Stack spacing={1.5} sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 15, color: text, lineHeight: 1.3 }}>
              {project}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: muted }}>
              {order.orderNumber} · {order.customerName || order.customer?.name || 'بدون مشتری'}
            </Typography>
          </Stack>
          <OrderSalesStatusBadge status={order.status} />
        </Stack>

        <Box
          sx={{
            px: 1.25,
            py: 0.75,
            borderRadius: 2,
            border: `1px solid ${alpha(WORKFLOW_ACCENT, 0.28)}`,
            bgcolor: alpha(WORKFLOW_ACCENT, 0.1),
            backdropFilter: 'blur(8px)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon={step?.icon || 'solar:route-bold-duotone'} width={18} color={WORKFLOW_ACCENT} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: WORKFLOW_ACCENT }}>
                مرحله فعلی: {ORDER_WORKFLOW_LABELS[workflowStage]}
              </Typography>
              <StageSummary stage={workflowStage} />
            </Box>
          </Stack>
        </Box>

        <OrderWorkflowProgress stage={workflowStage} compact />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto', pt: 0.5 }}>
          <Typography sx={{ fontSize: 12, color: muted }}>
            تحویل:{' '}
            {order.deliveryDate ? displayDateTime(order.deliveryDate) : 'زمان تحویل تعیین نشده'}
          </Typography>
          <Button
            component={Link}
            href={buildTenantHref(basePath, `/orders/${order.id}`)}
            size="small"
            variant="text"
            endIcon={<Iconify icon="solar:alt-arrow-left-linear" width={14} />}
            sx={{ fontWeight: 800, flexShrink: 0 }}
          >
            جزئیات
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

export function DashboardActiveOrdersPanel({ orders, loading, basePath, isDark, accent }: Props) {
  const pipelineOrders = useMemo(() => getPipelineOrders(orders, 9), [orders]);
  const activeCount = useMemo(() => filterUnfinishedOrders(orders).length, [orders]);

  const muted = isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted;

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (pipelineOrders.length === 0) {
    return (
      <Stack
        alignItems="center"
        spacing={1.5}
        sx={{
          py: 5,
          px: 2,
          ...tenantGlassSurfaceSx(isDark, { accentColor: accent, borderRadius: 3 }),
          border: `1px dashed ${isDark ? alpha('#fff', 0.14) : alpha(accent, 0.2)}`,
        }}
      >
        <Iconify icon="solar:clipboard-check-bold-duotone" width={40} color={accent} />
        <Typography sx={{ fontWeight: 800, opacity: 0.85 }}>سفارش جاریِ خاتمه‌نیافته‌ای وجود ندارد</Typography>
        <Typography sx={{ fontSize: 13, color: muted, textAlign: 'center' }}>
          با ثبت سفارش جدید، وضعیت مراحل (ثبت، طرح اختلاط، انبار، تولید) اینجا نمایش داده می‌شود.
        </Typography>
        <Button
          component={Link}
          href={buildTenantHref(basePath, '/orders/new')}
          variant="contained"
          size="small"
          startIcon={<Iconify icon="solar:add-circle-bold-duotone" width={18} />}
        >
          سفارش جدید
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Typography sx={{ fontSize: 13, color: muted }}>
          {activeCount} سفارش خاتمه‌نیافته · نمایش {pipelineOrders.length} مورد بر اساس نزدیک‌ترین تحویل
        </Typography>
        <Button
          component={Link}
          href={buildTenantHref(basePath, '/orders/list')}
          size="small"
          variant="outlined"
          endIcon={<Iconify icon="solar:alt-arrow-left-linear" width={14} />}
        >
          مشاهده همه سفارشات
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {pipelineOrders.map((order) => (
          <Grid key={order.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <OrderPipelineCard order={order} basePath={basePath} isDark={isDark} accent={accent} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
