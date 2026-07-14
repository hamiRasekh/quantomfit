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
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';

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
import { OrderProgressReportItem } from '@/features/orders/types';
import { paths } from '@/shared/routes/paths';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'process', label: 'فرایند' },
  { id: 'activity', label: 'فعالیت' },
  { id: 'status', label: 'وضعیت', width: 120 },
];

// ----------------------------------------------------------------------

export default function OrderProgressReportPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [report, setReport] = useState<{
    items: OrderProgressReportItem[];
    totalActivities: number;
    completedActivities: number;
    progressPercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const data = await ordersApi.getProgressReport(orderId);
      setReport(data);
    } catch (error: any) {
      toast.error(error.message || 'خطا در دریافت گزارش روند');
      router.push(paths.dashboard.orders.details(orderId));
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // Group by process
  const groupedData = report.items.reduce((acc, item) => {
    const key = item.processId;
    if (!acc[key]) {
      acc[key] = {
        processName: item.processName,
        activities: [],
      };
    }
    acc[key].activities.push(item);
    return acc;
  }, {} as Record<string, { processName: string; activities: OrderProgressReportItem[] }>);

  return (
    <MiniErpDashboardLayout>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="گزارش روند انجام سفارش"
          links={[
            { name: 'داشبورد', href: paths.dashboard.root },
            { name: 'سفارشات', href: paths.dashboard.orders.list },
            { name: 'گزارش روند انجام' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, mb: 3 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                درصد پیشرفت
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={report.progressPercentage}
                  sx={{ flexGrow: 1 }}
                  color={report.progressPercentage >= 100 ? 'success' : 'primary'}
                />
                <Typography variant="h6">{Math.round(report.progressPercentage)}%</Typography>
              </Box>
            </Box>
          </Card>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                فعالیت‌های انجام شده
              </Typography>
              <Typography variant="h4">
                {report.completedActivities} / {report.totalActivities}
              </Typography>
            </Box>
          </Card>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                فعالیت‌های باقی‌مانده
              </Typography>
              <Typography variant="h4">{report.totalActivities - report.completedActivities}</Typography>
            </Box>
          </Card>
        </Box>

        {/* Grouped Table */}
        {Object.entries(groupedData).map(([key, group]) => (
          <Card key={key} sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6">{group.processName}</Typography>
            </Box>
            <Scrollbar fillContent={false}>
              <Table>
                <TableHeadCustom headCells={TABLE_HEAD} />
                <TableBody>
                  {group.activities.map((item) => (
                    <TableRow key={item.activityId} hover>
                      <TableCell>{item.processName}</TableCell>
                      <TableCell>{item.activityName || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.isCompleted ? 'انجام شده' : 'انجام نشده'}
                          color={item.isCompleted ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </Card>
        ))}

        {Object.keys(groupedData).length === 0 && !loading && (
          <Card>
            <Box sx={{ py: 10 }}>
              <EmptyContent title="هیچ فعالیتی یافت نشد" />
            </Box>
          </Card>
        )}
      </DashboardContent>
    </MiniErpDashboardLayout>
  );
}
