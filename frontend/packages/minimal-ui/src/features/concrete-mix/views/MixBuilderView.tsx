'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'sonner';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { ApiError } from '@/shared/api/types';

import { concreteMixApi } from '../api/concreteMixApi';
import { MixBuilderWizard } from '../components/MixBuilderWizard';
import { MixBuilderResultPanel } from '../components/MixBuilderResultPanel';
import {
  BuilderOrderContext,
  BuilderPendingOrder,
  CalculateConcreteMixPayload,
  ConcreteMixCalculationResponse,
} from '../types';

export function MixBuilderView() {
  const { isDark, colors } = useTenantPageTheme();
  const basePath = useTenantBasePath();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const resultPanelRef = useRef<HTMLDivElement>(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [defaultCapacity, setDefaultCapacity] = useState(1);
  const [pendingOrders, setPendingOrders] = useState<BuilderPendingOrder[]>([]);
  const [orderContext, setOrderContext] = useState<BuilderOrderContext | null>(null);
  const [orderLoading, setOrderLoading] = useState(!!orderIdParam);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ConcreteMixCalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    settingsApi
      .getCompanyProfile()
      .then((profile) => {
        if (!active) return;
        const firstMixer = profile?.batchingMixers?.[0];
        if (firstMixer?.volumeM3) setDefaultCapacity(Number(firstMixer.volumeM3) || 1);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setProfileLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    concreteMixApi
      .listBuilderPendingOrders()
      .then((rows) => {
        if (active) setPendingOrders(rows);
      })
      .catch(() => {
        if (active) setPendingOrders([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!orderIdParam) {
      setOrderContext(null);
      setOrderLoading(false);
      return;
    }
    let active = true;
    setOrderLoading(true);
    setResult(null);
    concreteMixApi
      .getBuilderOrderContext(orderIdParam)
      .then((ctx) => {
        if (active) setOrderContext(ctx);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setOrderContext(null);
        const apiErr = e as ApiError;
        if (!apiErr.globalToastShown) {
          setError(apiErr.message ?? 'بارگذاری سفارش ناموفق بود');
        }
      })
      .finally(() => {
        if (active) setOrderLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderIdParam]);

  const handleSubmit = async (payload: CalculateConcreteMixPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await concreteMixApi.calculateBuilder(payload);
      setResult(res);
      setPendingOrders((prev) => prev.filter((o) => o.orderId !== payload.orderId));
      setOrderContext((prev) =>
        prev && prev.orderId === payload.orderId
          ? {
              ...prev,
              hasMixDesign: true,
              calculationRunId: res.formulaVersion.calculationRunId,
            }
          : prev,
      );

      const orderLabel =
        orderContext?.orderNumber && orderContext.orderId === payload.orderId
          ? `سفارش ${orderContext.orderNumber}`
          : 'طرح اختلاط';
      toast.success(`${orderLabel} با موفقیت محاسبه شد`);

      requestAnimationFrame(() => {
        resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (e: unknown) {
      const apiErr = e as ApiError;
      setResult(null);
      if (!apiErr.globalToastShown) {
        setError(apiErr.message ?? 'محاسبه با خطا مواجه شد');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const builderHref = (orderId: string) =>
    buildTenantHref(basePath, `/concrete-mix/builder?orderId=${orderId}`);

  const visiblePending = result
    ? []
    : orderIdParam
      ? pendingOrders.filter((o) => o.orderId !== orderIdParam)
      : pendingOrders;

  const showExistingMixAlert = Boolean(orderContext?.hasMixDesign && !result);

  if (profileLoading || orderLoading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader title="سازنده طرح اختلاط" isDark={isDark} />

      {showExistingMixAlert ? (
        <Alert
          severity="info"
          sx={{ borderRadius: 2 }}
          action={
            orderContext?.calculationRunId ? (
              <Button
                component={Link}
                href={buildTenantHref(basePath, `/concrete-mix/results/${orderContext.calculationRunId}`)}
                size="small"
                color="inherit"
              >
                مشاهده نتیجه قبلی
              </Button>
            ) : undefined
          }
        >
          سفارش {orderContext?.orderNumber} قبلاً طرح اختلاط دارد. می‌توانید نتیجه قبلی را ببینید یا دوباره محاسبه کنید.
        </Alert>
      ) : null}

      {!result && visiblePending.length > 0 && !orderIdParam ? (
        <Stack spacing={1}>
          {visiblePending.slice(0, 5).map((order) => (
            <Alert
              key={order.orderId}
              severity="warning"
              sx={{ borderRadius: 2 }}
              action={
                <Button component={Link} href={builderHref(order.orderId)} size="small" color="warning">
                  دریافت طرح اختلاط
                </Button>
              }
            >
              سفارش <strong>{order.orderNumber}</strong>
              {order.title ? ` (${order.title})` : ''} هنوز طرح اختلاط ندارد.
              {order.concreteGrade ? ` رده ${order.concreteGrade}` : ''}
            </Alert>
          ))}
        </Stack>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MixBuilderWizard
            isDark={isDark}
            accent={colors.primary}
            mixerBatchCapacity={defaultCapacity}
            orderContext={orderContext}
            loading={submitting}
            onSubmit={handleSubmit}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box ref={resultPanelRef}>
            {result ? (
              <MixBuilderResultPanel
                result={result}
                orderContext={orderContext}
                isDark={isDark}
                accent={colors.primary}
                basePath={basePath}
                onRecalculate={() => {
                  setResult(null);
                  setError(null);
                }}
              />
            ) : (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                {orderContext
                  ? 'پس از تأیید مواد اولیه و شرایط محیطی، جدول نتیجه طرح در همین ستون نمایش داده می‌شود.'
                  : 'پس از محاسبه، ترکیب مصالح (هر m³ و بچ) در همین ستون به‌صورت جدول نمایش داده می‌شود.'}
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
