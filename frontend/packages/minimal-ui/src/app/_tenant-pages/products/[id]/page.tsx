'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';

import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { DashboardContent } from '@/components/ui/layouts/dashboard/content';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';
import { ConfirmDialog } from '@/components/ui/custom-dialog';

import MiniErpDashboardLayout from '@/components/ui/layouts/dashboard/mini-erp-dashboard-layout';
import { productsApi } from '@/features/products/api/productsApi';
import { Product } from '@/features/products/types';
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog';
import { paths } from '@/shared/routes/paths';

// ----------------------------------------------------------------------

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const confirmDialog = useBoolean();
  const formDialog = useBoolean();

  const fetchData = useCallback(async () => {
    if (id) {
      try {
        setLoading(true);
        const response = await productsApi.getById(id as string);
        setProduct(response);
      } catch (error: any) {
        toast.error(error.message || 'خطا در دریافت اطلاعات');
        router.push(paths.dashboard.products.root);
      } finally {
        setLoading(false);
      }
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback(() => {
    formDialog.onTrue();
  }, [formDialog]);

  const handleDelete = useCallback(async () => {
    if (product) {
      try {
        await productsApi.delete(product.id);
        toast.success('محصول با موفقیت حذف شد');
        confirmDialog.onFalse();
        router.push(paths.dashboard.products.root);
      } catch (error: any) {
        toast.error(error.message || 'خطا در حذف محصول');
      }
    }
  }, [product, confirmDialog, router]);

  const handleCloseFormDialog = useCallback(() => {
    formDialog.onFalse();
    fetchData();
  }, [formDialog, fetchData]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!product) {
    return (
      <MiniErpDashboardLayout>
        <DashboardContent>
          <Typography variant="h6" color="error">
            محصول یافت نشد
          </Typography>
        </DashboardContent>
      </MiniErpDashboardLayout>
    );
  }

  return (
    <MiniErpDashboardLayout>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="جزئیات محصول"
          links={[
            { name: 'داشبورد', href: paths.dashboard.root },
            { name: 'محصولات', href: paths.dashboard.products.root },
            { name: product.name },
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={handleEdit}
              >
                ویرایش
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={confirmDialog.onTrue}
              >
                حذف
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardHeader title="اطلاعات محصول" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2">نام محصول:</Typography>
                    <Typography variant="body2">{product.name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2">کد محصول:</Typography>
                    <Typography
                      variant="body2"
                      component="code"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'action.hover',
                        px: 1,
                        py: 0.5,
                        borderRadius: 0.5,
                      }}
                    >
                      {product.code}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2">دسته‌بندی:</Typography>
                    <Typography variant="body2">
                      {product.category?.name || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2">وضعیت:</Typography>
                    <Typography variant="body2">
                      {product.isActive ? 'فعال' : 'غیرفعال'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2">تاریخ ایجاد:</Typography>
                    <Typography variant="body2">
                      {new Date(product.createdAt).toLocaleDateString('fa-IR')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2">آخرین به‌روزرسانی:</Typography>
                    <Typography variant="body2">
                      {new Date(product.updatedAt).toLocaleDateString('fa-IR')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {product.imageUrl && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardHeader title="تصویر محصول" />
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: 200,
                    }}
                  >
                    <Avatar
                      src={product.imageUrl}
                      alt={product.name}
                      variant="rounded"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 400,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <ProductFormDialog
          open={formDialog.value}
          onClose={handleCloseFormDialog}
          product={product}
          onSuccess={handleCloseFormDialog}
        />

        <ConfirmDialog
          open={confirmDialog.value}
          onClose={confirmDialog.onFalse}
          title="حذف"
          content="آیا از حذف این محصول اطمینان دارید؟"
          action={
            <Button variant="contained" color="error" onClick={handleDelete}>
              حذف
            </Button>
          }
        />
      </DashboardContent>
    </MiniErpDashboardLayout>
  );
}




