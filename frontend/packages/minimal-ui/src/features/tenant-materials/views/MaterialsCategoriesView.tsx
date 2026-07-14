'use client';

import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { MATERIALS_LIBRARY_SCOPE } from '../constants';

import { RawMaterialCategoryFormDialog } from '@/features/raw-material-categories/components/RawMaterialCategoryFormDialog';
import { rawMaterialCategoriesApi } from '@/features/raw-material-categories/api/rawMaterialCategoriesApi';
import {
  getCategoryAttributeNames,
  isCatalogCategory,
  RawMaterialCategory,
} from '@/features/raw-material-categories/types';

type Props = { isDark: boolean };

function CategoryCard({
  category,
  onOpen,
}: {
  category: RawMaterialCategory;
  onOpen: (category: RawMaterialCategory) => void;
}) {
  const catalog = isCatalogCategory(category);
  const attributeNames = getCategoryAttributeNames(category);

  return (
    <Card key={category.id} sx={{ p: 2.4, borderRadius: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Stack spacing={0.8} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontWeight: 900 }}>{category.name}</Typography>
            <Chip
              size="small"
              color={catalog ? 'info' : 'warning'}
              label={catalog ? 'پایه اسمارت بتن' : 'اختصاصی شرکت'}
            />
            <Chip
              size="small"
              variant="outlined"
              color={category.isActive ? 'success' : 'default'}
              label={category.isActive ? 'فعال' : 'غیرفعال'}
            />
          </Stack>
          {category.code ? (
            <Typography sx={{ fontSize: 13, opacity: 0.72, fontFamily: 'monospace' }}>{category.code}</Typography>
          ) : null}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {attributeNames.length ? (
              attributeNames.map((name) => (
                <Chip key={name} size="small" variant="outlined" label={`ویژگی: ${name}`} />
              ))
            ) : (
              <Typography sx={{ fontSize: 13, opacity: 0.65 }}>بدون ویژگی</Typography>
            )}
          </Stack>
        </Stack>
        <Button variant="outlined" onClick={() => onOpen(category)} sx={{ flexShrink: 0 }}>
          {catalog ? 'مشاهده' : 'ویرایش'}
        </Button>
      </Stack>
    </Card>
  );
}

export function MaterialsCategoriesView({ isDark }: Props) {
  const [categories, setCategories] = useState<RawMaterialCategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<RawMaterialCategory | null>(null);

  const load = async () => {
    const res = await rawMaterialCategoriesApi.getAll({ page: 1, limit: 200 });
    setCategories(res.data || []);
  };

  useEffect(() => {
    load().catch((error) => notifyApiError(error, 'خطا در دریافت دسته‌بندی‌ها'));
  }, []);

  const { catalogCategories, tenantCategories } = useMemo(() => {
    const catalog: RawMaterialCategory[] = [];
    const tenant: RawMaterialCategory[] = [];
    categories.forEach((category) => {
      if (isCatalogCategory(category)) catalog.push(category);
      else tenant.push(category);
    });
    return { catalogCategories: catalog, tenantCategories: tenant };
  }, [categories]);

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="دسته‌بندی مواد تولید"
        subtitle={`${MATERIALS_LIBRARY_SCOPE} ویژگی‌ها زیرمجموعه هر دسته و اختیاری هستند.`}
        isDark={isDark}
        action={
          <Button
            variant="contained"
            onClick={() => {
              setSelected(null);
              setDialogOpen(true);
            }}
          >
            دسته اختصاصی جدید
          </Button>
        }
      />

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        دسته‌های <strong>پایه اسمارت بتن</strong> از پنل ادمین همگام می‌شوند و در طرح اختلاط استفاده
        می‌شوند. شرکت می‌تواند برای مواد خاص، <strong>دسته اختصاصی</strong> با یک ویژگی اختیاری اضافه کند.
      </Alert>

      <Stack spacing={1.25}>
        <Typography sx={{ fontWeight: 800, fontSize: 14.5 }}>دسته‌های پایه (طرح اختلاط)</Typography>
        {catalogCategories.length ? (
          catalogCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onOpen={(item) => {
                setSelected(item);
                setDialogOpen(true);
              }}
            />
          ))
        ) : (
          <Typography sx={{ fontSize: 13.5, opacity: 0.7 }}>هنوز دسته پایه‌ای همگام نشده است.</Typography>
        )}
      </Stack>

      <Stack spacing={1.25}>
        <Typography sx={{ fontWeight: 800, fontSize: 14.5 }}>دسته‌های اختصاصی شرکت</Typography>
        {tenantCategories.length ? (
          tenantCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onOpen={(item) => {
                setSelected(item);
                setDialogOpen(true);
              }}
            />
          ))
        ) : (
          <Typography sx={{ fontSize: 13.5, opacity: 0.7 }}>
            دسته اختصاصی ثبت نشده — برای مواد خاص خارج از کاتالوگ پایه اضافه کنید.
          </Typography>
        )}
      </Stack>

      <RawMaterialCategoryFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        category={selected}
        onSuccess={() => {
          setDialogOpen(false);
          load();
        }}
      />
    </Stack>
  );
}
