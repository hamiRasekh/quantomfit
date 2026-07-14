'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';

import { toast } from 'sonner';
import dayjs from 'dayjs';

import { Iconify } from '@/components/ui/iconify';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { EmptyContent } from '@/components/ui/empty-content';
import { DashboardContent } from '@/components/ui/layouts/dashboard/content';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';

import MiniErpDashboardLayout from '@/components/ui/layouts/dashboard/mini-erp-dashboard-layout';
import { defectsApi } from '@/features/defects/api/defectsApi';
import { Defect, DefectType } from '@/features/defects/types';
import { paths } from '@/shared/routes/paths';

// ----------------------------------------------------------------------

const TYPE_LABELS: Record<DefectType, string> = {
  [DefectType.DEFECT]: 'نقص',
  [DefectType.WASTE]: 'ضایعات',
};

const TYPE_COLORS: Record<DefectType, 'error' | 'warning'> = {
  [DefectType.DEFECT]: 'error',
  [DefectType.WASTE]: 'warning',
};

// ----------------------------------------------------------------------

export default function DefectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [defect, setDefect] = useState<Defect | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDefect = async () => {
      try {
        setLoading(true);
        const data = await defectsApi.getById(id);
        setDefect(data);
      } catch (error: any) {
        toast.error(error.message || 'خطا در دریافت اطلاعات');
        router.push(paths.defects.list);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDefect();
    }
  }, [id, router]);

  const handlePrint = () => {
    window.open(paths.defects.print(id), '_blank');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!defect) {
    return (
      <MiniErpDashboardLayout>
        <DashboardContent>
          <EmptyContent title="نقص یافت نشد" description="نقص مورد نظر یافت نشد" />
        </DashboardContent>
      </MiniErpDashboardLayout>
    );
  }

  return (
    <MiniErpDashboardLayout>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="جزئیات نقص / ضایعات"
          links={[
            { name: 'داشبورد', href: paths.dashboard.root },
            { name: 'نقص و ضایعات', href: paths.defects.list },
            { name: 'جزئیات' },
          ]}
          action={
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:printer-bold" />}
              onClick={handlePrint}
            >
              چاپ
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardHeader title="اطلاعات نقص / ضایعات" />
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      نوع
                    </Typography>
                    <Chip
                      label={TYPE_LABELS[defect.type]}
                      color={TYPE_COLORS[defect.type]}
                      size="medium"
                    />
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      محصول
                    </Typography>
                    <Typography variant="body1">
                      {defect.product ? `${defect.product.code} - ${defect.product.name}` : '-'}
                    </Typography>
                  </Box>

                  {defect.activity && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          فعالیت
                        </Typography>
                        <Typography variant="body1">{defect.activity.name}</Typography>
                      </Box>
                    </>
                  )}

                  {defect.personnel && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          پرسنل
                        </Typography>
                        <Typography variant="body1">
                          {defect.personnel.firstName} {defect.personnel.lastName}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      تعداد
                    </Typography>
                    <Typography variant="h6">{defect.quantity.toLocaleString('fa-IR')}</Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      علت
                    </Typography>
                    <Typography variant="body1">{defect.reason}</Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      تاریخ و زمان وقوع
                    </Typography>
                    <Typography variant="body1">
                      {dayjs(defect.occurredAt).format('YYYY/MM/DD HH:mm')}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      تاریخ ثبت
                    </Typography>
                    <Typography variant="body1">
                      {dayjs(defect.createdAt).format('YYYY/MM/DD HH:mm')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DashboardContent>
    </MiniErpDashboardLayout>
  );
}




