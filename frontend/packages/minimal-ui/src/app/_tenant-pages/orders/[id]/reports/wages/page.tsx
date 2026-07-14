'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { Scrollbar } from '@/components/ui/scrollbar';
import { EmptyContent } from '@/components/ui/empty-content';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { DashboardContent } from '@/components/ui/layouts/dashboard/content';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';
import {
  TableHeadCustom,
  TableSkeleton,
  TableNoData,
} from '@/components/ui/table';

import MiniErpDashboardLayout from '@/components/ui/layouts/dashboard/mini-erp-dashboard-layout';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { OrderWageReportItem } from '@/features/orders/types';
import { paths } from '@/shared/routes/paths';
import { fDate } from '@/components/ui/utils/format-time';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'personnel', label: 'پرسنل' },
  { id: 'product', label: 'محصول' },
  { id: 'activity', label: 'فعالیت' },
  { id: 'quantity', label: 'مقدار', width: 100 },
  { id: 'duration', label: 'مدت زمان (دقیقه)', width: 150 },
  { id: 'wage', label: 'دستمزد (ریال)', width: 150 },
  { id: 'date', label: 'تاریخ', width: 150 },
];

// ----------------------------------------------------------------------

export default function OrderWageReportPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [report, setReport] = useState<{ items: OrderWageReportItem[]; totalWage: number; totalMinutes: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const data = await ordersApi.getWageReport(orderId);
      setReport(data);
    } catch (error: any) {
      toast.error(error.message || 'خطا در دریافت گزارش حقوق');
      router.push(paths.dashboard.orders.details(orderId));
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNumber = (value: number) => {
    return value.toLocaleString('fa-IR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!report) {
    return (
      <MiniErpDashboardLayout>
        <DashboardContent>
          <Typography variant="h6" color="error">
            گزارش یافت نشد
          </Typography>
        </DashboardContent>
      </MiniErpDashboardLayout>
    );
  }

  return (
    <MiniErpDashboardLayout>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="گزارش حقوق و دستمزد سفارش"
          links={[
            { name: 'داشبورد', href: paths.dashboard.root },
            { name: 'سفارشات', href: paths.dashboard.orders.list },
            { name: 'گزارش حقوق و دستمزد' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, mb: 3 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                مجموع دستمزد
              </Typography>
              <Typography variant="h4">{formatNumber(report.totalWage)} ریال</Typography>
            </Box>
          </Card>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                مجموع زمان کار
              </Typography>
              <Typography variant="h4">{formatNumber(report.totalMinutes)} دقیقه</Typography>
            </Box>
          </Card>
        </Box>

        {/* Table */}
        <Card>
          <Scrollbar fillContent={false}>
            <Table>
              <TableHeadCustom headCells={TABLE_HEAD} />
              <TableBody>
                {loading && <TableSkeleton rowCount={10} cellCount={TABLE_HEAD.length} />}

                {!loading && report.items && report.items.length > 0 && (
                  <>
                    {report.items.map((item) => (
                      <TableRow key={item.record.id} hover>
                        <TableCell>{item.personnelName || '-'}</TableCell>
                        <TableCell>{item.productName || '-'}</TableCell>
                        <TableCell>{item.activityName || '-'}</TableCell>
                        <TableCell>{formatNumber(item.record.quantityDone)}</TableCell>
                        <TableCell>{formatNumber(item.record.durationMinutes)}</TableCell>
                        <TableCell>{formatNumber(item.wage)}</TableCell>
                        <TableCell>{fDate(item.record.startedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {!loading && (!report.items || report.items.length === 0) && (
                  <TableNoData notFound colSpan={TABLE_HEAD.length} />
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Card>
      </DashboardContent>
    </MiniErpDashboardLayout>
  );
}
