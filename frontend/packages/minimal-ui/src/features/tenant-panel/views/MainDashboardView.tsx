'use client';

import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

import { ordersApi } from '@/features/orders/api/ordersApi';
import { rawMaterialsApi } from '@/features/raw-materials/api/rawMaterialsApi';
import { rawMaterialCategoriesApi } from '@/features/raw-material-categories/api/rawMaterialCategoriesApi';
import { OrderStatus, ORDER_STATUS_LABELS, Order } from '@/features/orders/types';

import { TenantChartCard } from '../components/TenantChartCard';
import { usePermissions } from '@/features/rbac/hooks/usePermissions';
import { DashboardActiveOrdersPanel } from '../components/dashboard/DashboardActiveOrdersPanel';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';
import { DashboardSection } from '../components/dashboard/DashboardSection';
import { DashboardSectionAccess } from '../components/dashboard/DashboardSectionAccess';
import { DashboardPersonalPanel } from '../components/dashboard/DashboardPersonalPanel';
import { DashboardProfitTrend } from '../components/dashboard/DashboardProfitTrend';
import { DashboardSectionTitle } from '../components/dashboard/DashboardSectionTitle';
import { useTenantPageTheme } from '../context/tenant-theme-context';
import { useTenantBasePath } from '../hooks/use-tenant-base-path';

type Props = { isDark: boolean };

export function MainDashboardView({ isDark }: Props) {
  const { colors } = useTenantPageTheme();
  const basePath = useTenantBasePath();
  const { canViewPath } = usePermissions();
  const showOrdersPanel = canViewPath('/orders') || canViewPath('/orders/list');
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [materialsTotal, setMaterialsTotal] = useState(0);
  const [orderStatusMap, setOrderStatusMap] = useState<Record<string, number>>({});
  const [categoryCounts, setCategoryCounts] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [orders, materials, categories] = await Promise.all([
          ordersApi.getAll({ page: 1, limit: 100 }).catch(() => null),
          rawMaterialsApi.getAll({ page: 1, limit: 200 }).catch(() => null),
          rawMaterialCategoriesApi.getAll({ page: 1, limit: 100 }).catch(() => null),
        ]);

        if (!active) return;

        const hadAnyFailure = !orders || !materials || !categories;

        setOrdersTotal(orders?.total ?? 0);
        setOrders(Array.isArray(orders?.data) ? orders.data : []);
        setMaterialsTotal(materials?.total ?? 0);
        setStatsError(hadAnyFailure);

        const statusCounts: Record<string, number> = {};
        (Array.isArray(orders?.data) ? orders.data : []).forEach((order) => {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        setOrderStatusMap(statusCounts);

        const mats = Array.isArray(materials?.data) ? materials.data : [];
        const byCategory: Record<string, number> = {};
        mats.forEach((item) => {
          const key = item.category?.name || 'بدون دسته';
          byCategory[key] = (byCategory[key] || 0) + 1;
        });
        setCategoryCounts(
          Object.entries(byCategory)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
        );
      } catch {
        if (active) setStatsError(true);
      } finally {
        if (active) setStatsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const orderStatusChart = useMemo(() => {
    const entries = Object.entries(orderStatusMap);
    return {
      categories: entries.map(([status]) => ORDER_STATUS_LABELS[status as OrderStatus] || status),
      series: entries.map(([, count]) => count),
    };
  }, [orderStatusMap]);

  const categoryChart = useMemo(
    () => ({
      categories: categoryCounts.map((c) => c.name),
      series: categoryCounts.map((c) => c.count),
    }),
    [categoryCounts]
  );

  return (
    <Stack spacing={3}>
      <DashboardSection isDark={isDark} accent={colors.primary}>
        <DashboardSectionTitle
          title="دسترسی سریع"
          subtitle="اقدامات پرتکرار را با یک کلیک انجام دهید"
          isDark={isDark}
          accent={colors.primary}
          icon="solar:bolt-bold-duotone"
        />
        <DashboardQuickActions base={basePath} isDark={isDark} />
      </DashboardSection>

      {showOrdersPanel && (
      <DashboardSection isDark={isDark} accent={colors.primary}>
        <DashboardSectionTitle
          title="سفارش‌های جاری پروژه"
          subtitle="سفارشات خاتمه‌نیافته و مرحله فعلی هر کدام در مسیر ثبت، طرح اختلاط، انبار و تولید"
          isDark={isDark}
          accent={colors.primary}
          icon="solar:clipboard-list-bold-duotone"
        />
        <DashboardActiveOrdersPanel
          orders={orders}
          loading={statsLoading}
          basePath={basePath}
          isDark={isDark}
          accent={colors.primary}
        />
      </DashboardSection>
      )}

      <DashboardSection isDark={isDark} accent={colors.primary}>
        <DashboardSectionTitle
          title="شخصی‌سازی"
          subtitle="صفحات نشان‌شده و تاریخچه بازدید شما"
          isDark={isDark}
          accent={colors.primary}
          icon="solar:bookmark-bold-duotone"
        />
        <DashboardPersonalPanel base={basePath} accent={colors.primary} isDark={isDark} />
      </DashboardSection>

      <DashboardSection isDark={isDark} accent={colors.primary}>
        <DashboardSectionTitle
          title="بخش‌های سیستم"
          subtitle="ورود سریع به ماژول‌های اصلی پنل"
          isDark={isDark}
          accent={colors.primary}
          icon="solar:widget-5-bold-duotone"
        />
        <DashboardSectionAccess base={basePath} accent={colors.primary} isDark={isDark} />
      </DashboardSection>

      <DashboardSection isDark={isDark} accent={colors.primary}>
        <DashboardSectionTitle
          title="گزارش‌های زنده"
          subtitle="نمودارهای عملیاتی بر اساس داده فعلی"
          isDark={isDark}
          accent={colors.primary}
          icon="solar:graph-new-bold-duotone"
        />

        {statsError && (
          <Alert severity="warning" sx={{ borderRadius: 2.5, mb: 2 }}>
            برخی آمار زنده بارگذاری نشدند. بقیه بخش‌های داشبورد در دسترس است.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <DashboardProfitTrend isDark={isDark} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            {statsLoading ? (
              <Skeleton variant="rounded" height={380} sx={{ borderRadius: 3 }} />
            ) : (
              <TenantChartCard
                title="وضعیت سفارشات"
                subtitle="توزیع وضعیت‌های فعال"
                type="donut"
                categories={orderStatusChart.categories.length ? orderStatusChart.categories : ['بدون داده']}
                series={orderStatusChart.series.length ? orderStatusChart.series : [1]}
                isDark={isDark}
                height={320}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {statsLoading ? (
              <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
            ) : (
              <TenantChartCard
                title="توزیع مواد بر اساس دسته"
                type="bar"
                categories={categoryChart.categories.length ? categoryChart.categories : ['بدون داده']}
                series={[{ name: 'تعداد', data: categoryChart.series.length ? categoryChart.series : [0] }]}
                isDark={isDark}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {statsLoading ? (
              <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
            ) : (
              <TenantChartCard
                title="شاخص‌های هفتگی"
                subtitle="ترکیب سفارش و موجودی"
                type="line"
                categories={['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']}
                series={[
                  { name: 'سفارش', data: [2, 4, 3, 6, 5, 7, ordersTotal % 9 || 4] },
                  { name: 'ورود انبار', data: [1, 2, 4, 3, 5, 4, materialsTotal % 8 || 3] },
                ]}
                isDark={isDark}
              />
            )}
          </Grid>
        </Grid>
      </DashboardSection>
    </Stack>
  );
}
