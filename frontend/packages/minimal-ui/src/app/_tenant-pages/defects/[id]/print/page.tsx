'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';

import { toast } from 'sonner';
import dayjs from 'dayjs';

import { Iconify } from '@/components/ui/iconify';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { EmptyContent } from '@/components/ui/empty-content';

import { defectsApi } from '@/features/defects/api/defectsApi';
import { Defect, DefectType } from '@/features/defects/types';

// ----------------------------------------------------------------------

const TYPE_LABELS: Record<DefectType, string> = {
  [DefectType.DEFECT]: 'نقص',
  [DefectType.WASTE]: 'ضایعات',
};

// ----------------------------------------------------------------------

export default function DefectPrintPage() {
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
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDefect();
    }
  }, [id]);

  useEffect(() => {
    if (defect && !loading) {
      // Auto print when page loads
      window.print();
    }
  }, [defect, loading]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!defect) {
    return <EmptyContent title="نقص یافت نشد" description="نقص مورد نظر یافت نشد" />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
        '@media print': {
          p: 0,
          bgcolor: 'white',
        },
      }}
    >
      {/* Print button - hidden when printing */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          '@media print': {
            display: 'none',
          },
        }}
      >
        <Button variant="contained" startIcon={<Iconify icon="solar:printer-bold" />} onClick={handlePrint}>
          چاپ
        </Button>
      </Box>

      <Card
        sx={{
          maxWidth: '210mm',
          margin: '0 auto',
          '@media print': {
            boxShadow: 'none',
            border: 'none',
          },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Company Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              فرم ثبت نقص / ضایعات
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dayjs().format('YYYY/MM/DD')}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Defect Details */}
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                نوع
              </Typography>
              <Chip label={TYPE_LABELS[defect.type]} color={defect.type === DefectType.DEFECT ? 'error' : 'warning'} />
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                محصول
              </Typography>
              <Typography variant="body1">
                {defect.product ? `${defect.product.code} - ${defect.product.name}` : '-'}
              </Typography>
            </Box>

            {defect.activity && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  فعالیت
                </Typography>
                <Typography variant="body1">{defect.activity.name}</Typography>
              </Box>
            )}

            {defect.personnel && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  پرسنل
                </Typography>
                <Typography variant="body1">
                  {defect.personnel.firstName} {defect.personnel.lastName}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                تعداد
              </Typography>
              <Typography variant="h6">{defect.quantity.toLocaleString('fa-IR')}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                علت
              </Typography>
              <Typography variant="body1">{defect.reason}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                تاریخ و زمان وقوع
              </Typography>
              <Typography variant="body1">
                {dayjs(defect.occurredAt).format('YYYY/MM/DD HH:mm')}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 4 }} />

          {/* Signatures */}
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid size={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  امضای کنترل کیفیت
                </Typography>
                <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider', mt: 2 }} />
              </Box>
            </Grid>
            <Grid size={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  امضای تولید
                </Typography>
                <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider', mt: 2 }} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}




