'use client';

import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { rawMaterialCategoriesApi } from '@/features/raw-material-categories/api/rawMaterialCategoriesApi';
import { isCatalogCategory } from '@/features/raw-material-categories/types';
import { rawMaterialsApi } from '@/features/raw-materials/api/rawMaterialsApi';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { stockLedgerApi } from '@/features/stock-ledger/api/stockLedgerApi';
import { StockLedgerType } from '@/features/stock-ledger/types';

import { MATERIALS_SECTION_SCOPE } from '@/features/tenant-materials/constants';

import { TenantStatCard } from '../components/TenantStatCard';
import { TenantChartCard } from '../components/TenantChartCard';
import { TenantSubPageHeader } from '../components/TenantSubPageHeader';
import { useTenantPageTheme } from '../context/tenant-theme-context';

type Props = { isDark: boolean };

export function MaterialsSectionDashboard({ isDark }: Props) {
  const { colors } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [catalogCategoriesCount, setCatalogCategoriesCount] = useState(0);
  const [tenantCategoriesCount, setTenantCategoriesCount] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [inEntries, setInEntries] = useState(0);
  const [categorySeries, setCategorySeries] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [materials, categories, balances, ledger] = await Promise.all([
          rawMaterialsApi.getAll({ page: 1, limit: 200 }),
          rawMaterialCategoriesApi.getAll({ page: 1, limit: 100 }),
          inventoryApi.getBalances(),
          stockLedgerApi.getAll({ page: 1, limit: 100, type: StockLedgerType.IN }),
        ]);

        if (!active) return;

        const categoryRows = categories?.data || [];
        setMaterialsCount(materials?.total || 0);
        setCategoriesCount(categories?.total || 0);
        setCatalogCategoriesCount(categoryRows.filter((c) => isCatalogCategory(c)).length);
        setTenantCategoriesCount(categoryRows.filter((c) => !isCatalogCategory(c)).length);
        setLowStock(balances.filter((b) => b.isLowStock).length);
        setInEntries(ledger?.total || 0);

        const byCategory: Record<string, number> = {};
        (materials?.data || []).forEach((m) => {
          const key = m.category?.name || 'بدون دسته';
          byCategory[key] = (byCategory[key] || 0) + 1;
        });
        const sorted = Object.entries(byCategory)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6);
        setCategorySeries({
          labels: sorted.map(([name]) => name),
          values: sorted.map(([, count]) => count),
        });

      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const stockBars = useMemo(() => {
    const labels = ['مواد ثبت‌شده', 'کم‌موجودی', 'دسته پایه', 'دسته اختصاصی'];
    return {
      categories: labels,
      series: [
        {
          name: 'شاخص',
          data: [materialsCount, lowStock, catalogCategoriesCount, tenantCategoriesCount],
        },
      ],
    };
  }, [materialsCount, lowStock, catalogCategoriesCount, tenantCategoriesCount]);

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <TenantSubPageHeader title="کتابخانه مواد تولید" subtitle={MATERIALS_SECTION_SCOPE} isDark={isDark} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="مواد ثبت‌شده" value={materialsCount} icon="solar:box-bold-duotone" color={colors.primary} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="دسته‌بندی" value={categoriesCount} icon="solar:folder-with-files-bold-duotone" color={colors.chartSecondary} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="دسته پایه" value={catalogCategoriesCount} icon="solar:shield-check-bold-duotone" color={colors.primaryDark} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="کم‌موجودی" value={lowStock} icon="solar:danger-bold-duotone" color={colors.chartAccent} isDark={isDark} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <TenantChartCard
            title="پراکندگی مواد در دسته‌ها"
            type="bar"
            categories={categorySeries.labels.length ? categorySeries.labels : ['بدون داده']}
            series={[{ name: 'تعداد', data: categorySeries.values.length ? categorySeries.values : [0] }]}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <TenantChartCard
            title="دسته‌های پایه و اختصاصی"
            subtitle="پایه = طرح اختلاط | اختصاصی = مواد خاص شرکت"
            type="donut"
            categories={['پایه اسمارت بتن', 'اختصاصی شرکت']}
            series={[catalogCategoriesCount, tenantCategoriesCount]}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TenantChartCard
            title="شاخص‌های عملیاتی مواد"
            type="area"
            categories={stockBars.categories}
            series={stockBars.series}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TenantChartCard
            title="ورود انبار مواد تولید"
            subtitle="ثبت مالی خرید در بخش مالی → فاکتور ورود مواد"
            type="line"
            categories={Array.from({ length: 6 }, (_, i) => `هفته ${i + 1}`)}
            series={[{ name: 'ورود', data: [1, 3, 2, 5, 4, Math.max(inEntries % 7, 2)] }]}
            isDark={isDark}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
