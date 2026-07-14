'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { DashboardContent } from '@/components/ui/layouts/dashboard/content';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';
import { TableHeadCustom } from '@/components/ui/table';
import { Scrollbar } from '@/components/ui/scrollbar';

import MiniErpDashboardLayout from '@/components/ui/layouts/dashboard/mini-erp-dashboard-layout';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { Order, OrderStatus, OrderProgressReport, OrderMaterialsReport } from '@/features/orders/types';
import { OrderSupplyMaterialsModal } from '@/features/orders/components/OrderSupplyMaterialsModal';
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from '@/features/orders/types';
import { OrderItem } from '@/features/orders/types';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { paths } from '@/shared/routes/paths';
import { fDate } from '@/components/ui/utils/format-time';

// ----------------------------------------------------------------------

export default function OrderDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [progressReport, setProgressReport] = useState<OrderProgressReport | null>(null);
  const [materialsReport, setMaterialsReport] = useState<OrderMaterialsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [supplyModalOpen, setSupplyModalOpen] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const [orderData, progressData, materialsData] = await Promise.all([
        ordersApi.getById(orderId),
        ordersApi.getProgressReport(orderId).catch(() => null),
        ordersApi.getMaterialsReport(orderId).catch(() => null),
      ]);
      setOrder(orderData);
      setProgressReport(progressData);
      setMaterialsReport(materialsData);
    } catch (error: any) {
      toast.error(error.message || 'خطا در دریافت اطلاعات');
      router.push(paths.dashboard.orders.list);
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  const refetchMaterialsAndOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const [orderData, materialsData] = await Promise.all([
        ordersApi.getById(orderId),
        ordersApi.getMaterialsReport(orderId).catch(() => null),
      ]);
      setOrder(orderData);
      setMaterialsReport(materialsData);
    } catch {
      // ignore
    }
  }, [orderId]);

  const handleConfirmMaterialsSupplied = useCallback(async () => {
    if (!orderId) return;
    await ordersApi.confirmMaterialsSupplied(orderId);
    const orderData = await ordersApi.getById(orderId);
    setOrder(orderData);
  }, [orderId]);

  const handleItemStatusChange = useCallback(
    async (itemId: string, status: string) => {
      if (!orderId) return;
      setUpdatingItemId(itemId);
      try {
        const orderData = await ordersApi.updateItemStatus(orderId, itemId, status);
        setOrder(orderData);
        toast.success('وضعیت قلم سفارش به‌روز شد');
      } catch (err: any) {
        toast.error(err.message || 'خطا در تغییر وضعیت');
      } finally {
        setUpdatingItemId(null);
      }
    },
    [orderId]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNumber = (value: number) => {
    return value.toLocaleString('fa-IR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusLabel = (status: OrderStatus) => ORDER_STATUS_LABELS[status] || status;

  const getStatusColor = (status: OrderStatus) => {
    if (status === OrderStatus.DELIVERED || status === OrderStatus.COMPLETED || status === OrderStatus.FINANCIAL) return 'success';
    if (status === OrderStatus.CANCELLED) return 'error';
    if (status === OrderStatus.DRAFT || status === OrderStatus.PENDING) return 'default';
    if (status === OrderStatus.IN_PROGRESS) return 'info';
    return 'warning';
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!order) {
    return (
      <MiniErpDashboardLayout>
        <DashboardContent>
          <Typography variant="h6" color="error">
            سفارش یافت نشد
          </Typography>
        </DashboardContent>
      </MiniErpDashboardLayout>
    );
  }

  const inProgressActivities = progressReport?.items.filter((item) => !item.isCompleted) || [];
  const hasMaterialShortage = (materialsReport?.materialsWithShortage || 0) > 0;
  const isDelayed = order.deliveryDate && new Date(order.deliveryDate) < new Date() && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED;

  return (
    <MiniErpDashboardLayout>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="داشبورد سفارش"
          links={[
            { name: 'داشبورد', href: paths.dashboard.root },
            { name: 'سفارشات', href: paths.dashboard.orders.list },
            { name: order.orderNumber },
            { name: 'داشبورد' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Alerts */}
        {hasMaterialShortage && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {materialsReport?.materialsWithShortage} ماده اولیه با کمبود موجودی وجود دارد. لطفاً{' '}
            <Button
              size="small"
              onClick={() => router.push(paths.dashboard.orders.reports.materials(orderId))}
            >
              گزارش مواد اولیه
            </Button>{' '}
            را بررسی کنید.
          </Alert>
        )}

        {isDelayed && (
          <Alert severity="error" sx={{ mb: 3 }}>
            این سفارش از تاریخ تحویل پیش‌بینی شده گذشته است.
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  درصد پیشرفت
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={order.progressPercentage || 0}
                    sx={{ flexGrow: 1 }}
                    color={
                      (order.progressPercentage || 0) >= 100
                        ? 'success'
                        : (order.progressPercentage || 0) > 0
                        ? 'primary'
                        : 'inherit'
                    }
                  />
                  <Typography variant="h6">{Math.round(order.progressPercentage || 0)}%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  مبلغ کل
                </Typography>
                <Typography variant="h5">{formatNumber(order.totalAmount)} ریال</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  تاریخ تحویل
                </Typography>
                <Typography variant="body1">
                  {order.deliveryDate ? fDate(order.deliveryDate) : 'تعیین نشده'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* اقلام سفارش با وضعیت و امکان تغییر دونه‌دونه */}
        {order.items && order.items.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="اقلام سفارش"
              subheader={
                (() => {
                  const total = order.items.length;
                  const completed = order.items.filter(
                    (i: OrderItem) => i.status === 'COMPLETED' || i.status === 'DELIVERED' || i.status === 'SHIPPED'
                  ).length;
                  return `${completed} از ${total} قلم تکمیل شده`;
                })()
              }
            />
            <CardContent>
              <Scrollbar>
                <Table size="small">
                  <TableHeadCustom
                    headCells={[
                      { id: 'product', label: 'محصول' },
                      { id: 'quantity', label: 'تعداد', width: 90 },
                      { id: 'unitPrice', label: 'قیمت واحد', width: 120 },
                      { id: 'totalPrice', label: 'مجموع', width: 120 },
                      { id: 'status', label: 'وضعیت', width: 160 },
                    ]}
                  />
                  <TableBody>
                    {order.items.map((item: OrderItem) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          {item.productName ?? item.productId}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatNumber(Number(item.unitPrice || 0))} ریال</TableCell>
                        <TableCell>{formatNumber(Number(item.totalPrice || 0))} ریال</TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 140 }} disabled={updatingItemId === item.id}>
                            <InputLabel>وضعیت</InputLabel>
                            <Select
                              label="وضعیت"
                              value={item.status || 'DRAFT'}
                              onChange={(e) => handleItemStatusChange(item.id, e.target.value)}
                            >
                              {ORDER_STATUS_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          {/* Progress Details */}
          {progressReport && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="جزئیات پیشرفت"
                  action={
                    <Button
                      size="small"
                      onClick={() => router.push(paths.dashboard.orders.reports.progress(orderId))}
                    >
                      مشاهده کامل
                    </Button>
                  }
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      فعالیت‌های انجام شده
                    </Typography>
                    <Typography variant="h4">
                      {progressReport.completedActivities} / {progressReport.totalActivities}
                    </Typography>
                  </Box>
                  {inProgressActivities.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        فعالیت‌های در حال انجام:
                      </Typography>
                      <List dense>
                        {inProgressActivities.slice(0, 5).map((item) => (
                          <ListItem key={item.activityId} sx={{ px: 0 }}>
                            <ListItemText
                              primary={item.activityName || '-'}
                              secondary={item.processName}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Materials Summary - Full Table */}
          {materialsReport && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader
                  title="لیست مواد اولیه مورد نیاز"
                  action={
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant={hasMaterialShortage ? 'contained' : 'outlined'}
                        startIcon={<Iconify icon="solar:box-bold" />}
                        onClick={() => setSupplyModalOpen(true)}
                      >
                        تامین مواد
                      </Button>
                      <Button
                        size="small"
                        onClick={() => router.push(paths.dashboard.orders.reports.materials(orderId))}
                      >
                        مشاهده کامل
                      </Button>
                    </Stack>
                  }
                />
                <CardContent>
                  <Scrollbar>
                    <Table>
                      <TableHeadCustom
                        headCells={[
                          { id: 'code', label: 'کد' },
                          { id: 'name', label: 'نام ماده اولیه' },
                          { id: 'unit', label: 'واحد', width: 80 },
                          { id: 'required', label: 'مقدار مورد نیاز', width: 120 },
                          { id: 'current', label: 'موجودی فعلی', width: 120 },
                          { id: 'shortage', label: 'کمبود', width: 120 },
                          { id: 'status', label: 'وضعیت', width: 100 },
                        ]}
                      />
                      <TableBody>
                        {materialsReport.items.map((item) => (
                          <TableRow key={item.rawMaterialId} hover>
                            <TableCell>{item.rawMaterialCode}</TableCell>
                            <TableCell>{item.rawMaterialName}</TableCell>
                            <TableCell>{item.unitName}</TableCell>
                            <TableCell>{formatNumber(item.requiredQuantity)}</TableCell>
                            <TableCell>{formatNumber(item.currentStock)}</TableCell>
                            <TableCell>{formatNumber(item.shortage)}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.shortage > 0 ? `کمبود ${formatNumber(item.shortage)}` : 'کافی'}
                                color={item.shortage > 0 ? 'error' : 'success'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                  {order?.materialsSuppliedConfirmedAt && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      تامین مواد اولیه توسط ادمین در {fDate(order.materialsSuppliedConfirmedAt)} تایید شده است.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Progress Timeline Chart */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="نمودار پیشرفت" />
              <CardContent>
                <Box sx={{ position: 'relative', height: 200 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${order.progressPercentage || 0}%`,
                      bgcolor: (order.progressPercentage || 0) >= 100 ? 'success.main' : 'primary.main',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      pb: 2,
                    }}
                  >
                    <Typography variant="h4" color="white">
                      {Math.round(order.progressPercentage || 0)}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      100%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      0%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                title="گزارش‌ها"
                action={
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="solar:download-bold" />}
                      onClick={() => {
                        // Export functionality - can be implemented later
                        toast.info('قابلیت اکسپورت به زودی اضافه خواهد شد');
                      }}
                    >
                      اکسپورت PDF
                    </Button>
                  </Stack>
                }
              />
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:wallet-money-bold" />}
                    onClick={() => router.push(paths.dashboard.orders.reports.wages(orderId))}
                  >
                    گزارش حقوق و دستمزد
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:graph-up-bold" />}
                    onClick={() => router.push(paths.dashboard.orders.reports.progress(orderId))}
                  >
                    گزارش روند انجام
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:box-bold" />}
                    onClick={() => router.push(paths.dashboard.orders.reports.materials(orderId))}
                  >
                    گزارش مواد اولیه
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {materialsReport && (
          <OrderSupplyMaterialsModal
            open={supplyModalOpen}
            onClose={() => setSupplyModalOpen(false)}
            orderId={orderId}
            items={materialsReport.items}
            materialsWithShortage={materialsReport.materialsWithShortage}
            allSupplied={materialsReport.materialsWithShortage === 0}
            materialsConfirmed={!!order?.materialsSuppliedConfirmedAt}
            onSuccess={refetchMaterialsAndOrder}
            onConfirmMaterialsSupplied={handleConfirmMaterialsSupplied}
          />
        )}
      </DashboardContent>
    </MiniErpDashboardLayout>
  );
}
