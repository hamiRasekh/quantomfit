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
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';

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
import { OrderMaterialsReportItem } from '@/features/orders/types';
import { paths } from '@/shared/routes/paths';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'code', label: 'کد' },
  { id: 'name', label: 'نام ماده اولیه' },
  { id: 'unit', label: 'واحد', width: 100 },
  { id: 'required', label: 'مقدار مورد نیاز', width: 150 },
  { id: 'current', label: 'موجودی فعلی', width: 150 },
  { id: 'shortage', label: 'کمبود', width: 150 },
  { id: 'status', label: 'وضعیت', width: 120 },
];

// ----------------------------------------------------------------------

export default function OrderMaterialsReportPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [report, setReport] = useState<{
    items: OrderMaterialsReportItem[];
    totalMaterials: number;
    materialsWithShortage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const data = await ordersApi.getMaterialsReport(orderId);
      setReport(data);
    } catch (error: any) {
      toast.error(error.message || 'خطا در دریافت گزارش مواد اولیه');
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
          heading="گزارش مواد اولیه سفارش"
          links={[
            { name: 'داشبورد', href: paths.dashboard.root },
            { name: 'سفارشات', href: paths.dashboard.orders.list },
            { name: 'گزارش مواد اولیه' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, mb: 3 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                تعداد مواد اولیه
              </Typography>
              <Typography variant="h4">{report.totalMaterials}</Typography>
            </Box>
          </Card>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                مواد اولیه با کمبود
              </Typography>
              <Typography variant="h4" color={report.materialsWithShortage > 0 ? 'error.main' : 'success.main'}>
                {report.materialsWithShortage}
              </Typography>
            </Box>
          </Card>
        </Box>

        {/* Alert for shortages */}
        {report.materialsWithShortage > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {report.materialsWithShortage} ماده اولیه با کمبود موجودی وجود دارد
          </Alert>
        )}

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
                      <TableRow key={item.rawMaterialId} hover>
                        <TableCell>
                          <Box
                            component="code"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                              bgcolor: 'action.hover',
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.5,
                            }}
                          >
                            {item.rawMaterialCode}
                          </Box>
                        </TableCell>
                        <TableCell>{item.rawMaterialName}</TableCell>
                        <TableCell>{item.unitName}</TableCell>
                        <TableCell>{formatNumber(item.requiredQuantity)}</TableCell>
                        <TableCell>{formatNumber(item.currentStock)}</TableCell>
                        <TableCell>
                          {item.shortage > 0 ? (
                            <Typography color="error.main">{formatNumber(item.shortage)}</Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.shortage > 0 ? 'کمبود' : 'کافی'}
                            color={item.shortage > 0 ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
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
