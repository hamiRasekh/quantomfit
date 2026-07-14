'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFNumberInput } from '@/components/ui/hook-form';
import { assignmentsApi } from '../api/assignmentsApi';
import { CreateAssignmentDto, AvailablePersonnel } from '../types';
import { personnelApi } from '@/features/personnel/api/personnelApi';
import { Personnel } from '@/features/personnel/types';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { Order, OrderStatus } from '@/features/orders/types';
import { processesApi } from '@/features/processes/api/processesApi';
import { Process } from '@/features/processes/types';
import { activitiesApi } from '@/features/activities/api/activitiesApi';
import { Activity } from '@/features/activities/types';
import { productsApi } from '@/features/products/api/productsApi';
import { Product } from '@/features/products/types';

// ----------------------------------------------------------------------

const AssignmentSchema = z.object({
  orderId: z.string().min(1, 'سفارش الزامی است'),
  processId: z.string().min(1, 'فرایند الزامی است'),
  activityId: z.string().min(1, 'فعالیت الزامی است'),
  productId: z.string().min(1, 'محصول الزامی است'),
  quantity: z.number().min(1, 'تعداد باید حداقل 1 باشد'),
  personnelId: z.string().min(1, 'پرسنل الزامی است'),
  notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof AssignmentSchema>;

/** وضعیت‌های محصول در سفارش که قابل واگذاری هستند (در صف انجام، در حال انجام) */
const ASSIGNABLE_ITEM_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.IN_PROGRESS];

const STORAGE_KEY_LAST_SEEN = 'assignments:lastSeenAssignableKeys';

/** گزینه انتخاب محصول از سفارش‌های باز (در حال انجام) */
export interface OrderProductOption {
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
}

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultOrderId?: string;
};

const STEPS = [
  'انتخاب محصول از سفارش‌های در حال انجام',
  'فرایند، فعالیت و مقدار انجام',
  'انتخاب پرسنل و یادداشت',
];

export function CreateAssignmentDialog({ open, onClose, onSuccess, defaultOrderId }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [orderProductOptions, setOrderProductOptions] = useState<OrderProductOption[]>([]);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [availablePersonnel, setAvailablePersonnel] = useState<AvailablePersonnel[]>([]);
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAssignableCount, setNewAssignableCount] = useState<number>(0);
  const [newAssignableKeysToAck, setNewAssignableKeysToAck] = useState<string[]>([]);

  const methods = useForm<AssignmentFormValues>({
    resolver: zodResolver(AssignmentSchema),
    defaultValues: {
      orderId: defaultOrderId || '',
      processId: '',
      activityId: '',
      productId: '',
      quantity: 1,
      personnelId: '',
      notes: '',
    },
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const orderId = watch('orderId');
  const productId = watch('productId');
  const processId = watch('processId');
  const activityId = watch('activityId');

  // استپ ۰: بارگذاری سفارش‌های باز و ساخت لیست محصولات
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    ordersApi
      .getOpenOrders()
      .then(async (orders) => {
        const productIds = new Set<string>();
        const items: Array<{
          orderId: string;
          orderNumber: string;
          productId: string;
          quantity: number;
          uniqueKey: string;
        }> = [];
        ;(orders || []).forEach((order: any) => {
          const itemsList = order.items || [];
          itemsList.forEach((item: any, idx: number) => {
            const itemStatus = item.status as OrderStatus | undefined;
            const isAssignable = itemStatus && ASSIGNABLE_ITEM_STATUSES.includes(itemStatus);
            if (item.productId && isAssignable) {
              productIds.add(item.productId);
              const uniqueKey = item.id || `${order.id}-${item.productId}-${idx}`;
              items.push({
                orderId: order.id,
                orderNumber: order.orderNumber || order.id?.slice(0, 8) || '',
                productId: item.productId,
                quantity: item.quantity || 1,
                uniqueKey,
              });
            }
          });
        });
        const productMap: Record<string, string> = {};
        const prods = await productsApi.getAll({ limit: 500, isActive: true }).catch(() => ({ data: [] }));
        const list = Array.isArray(prods.data) ? prods.data : (prods as any).data ?? [];
        list.forEach((p: Product) => {
          productMap[p.id] = `${p.name}${p.code ? ` (${p.code})` : ''}`;
        });
        const options: OrderProductOption[] = items.map((i) => ({
          orderId: i.orderId,
          orderNumber: i.orderNumber,
          productId: i.productId,
          productName: productMap[i.productId] || i.productId,
          quantity: i.quantity,
        }));
        setOrderProductOptions(options);

        // تشخیص محصولات جدید و نمایش Alert (فقط وقتی قبلاً بازدید شده و محصول جدیدی اضافه شده)
        if (typeof window !== 'undefined') {
          let lastSeen: string[] = JSON.parse(
            localStorage.getItem(STORAGE_KEY_LAST_SEEN) || '[]'
          );
          const currentKeys = items.map((i) => i.uniqueKey);
          if (lastSeen.length === 0 && currentKeys.length > 0) {
            localStorage.setItem(STORAGE_KEY_LAST_SEEN, JSON.stringify(currentKeys));
            lastSeen = currentKeys;
          }
          const lastSeenSet = new Set(lastSeen);
          const newKeys = currentKeys.filter((k) => !lastSeenSet.has(k));
          if (lastSeen.length > 0 && newKeys.length > 0) {
            setNewAssignableCount(newKeys.length);
            setNewAssignableKeysToAck(newKeys);
          } else {
            setNewAssignableCount(0);
            setNewAssignableKeysToAck([]);
          }
        }
      })
      .catch(() => {
        toast.error('خطا در دریافت سفارش‌های در حال انجام');
        setOrderProductOptions([]);
        setNewAssignableCount(0);
      })
      .finally(() => setLoading(false));
  }, [open]);

  // وقتی orderId و productId انتخاب شد، بارگذاری جزئیات سفارش و فرایند/فعالیت
  useEffect(() => {
    if (!orderId || !productId || activeStep < 1) {
      setOrderDetail(null);
      setProcesses([]);
      setActivities([]);
      return;
    }
    setLoading(true);
    ordersApi
      .getById(orderId)
      .then((order) => {
        setOrderDetail(order);
        const processActivities = getProcessActivitiesForProduct(order, productId);
        if (processActivities.length === 0) {
          setProcesses([]);
          setActivities([]);
          setLoading(false);
          return;
        }
        const processIds = Array.from(new Set(processActivities.map((pa: any) => pa.processId)));
        Promise.all(processIds.map((id: string) => processesApi.getById(id).catch(() => null))).then(
          (processesData) => {
            setProcesses(processesData.filter((p): p is Process => p !== null));
            setLoading(false);
          }
        );
      })
      .catch(() => {
        setOrderDetail(null);
        setProcesses([]);
        setActivities([]);
        setLoading(false);
      });
  }, [orderId, productId, activeStep]);

  function getProcessActivitiesForProduct(order: Order, prodId: string): Array<{ processId: string; activityIds?: string[] }> {
    const items = order.items || [];
    const item = items.find((i: any) => i.productId === prodId);
    if (item?.processActivities?.length) {
      return item.processActivities;
    }
    return order.processActivities || [];
  }

  useEffect(() => {
    if (!processId || !orderDetail || !productId) {
      setActivities([]);
      return;
    }
    const processActivities = getProcessActivitiesForProduct(orderDetail, productId);
    const relevantPA = processActivities.find((pa: any) => pa.processId === processId);
    if (!relevantPA?.activityIds?.length) {
      setActivities([]);
      return;
    }
    Promise.all(
      relevantPA.activityIds.map((id: string) => activitiesApi.getById(id).catch(() => null))
    ).then((activitiesData) => {
      setActivities(activitiesData.filter((a): a is Activity => a !== null));
    });
  }, [processId, orderDetail, productId]);

  useEffect(() => {
    if (activityId && processId && activeStep >= 2) {
      setLoading(true);
      assignmentsApi
        .getAvailablePersonnel(activityId, processId)
        .then(setAvailablePersonnel)
        .catch((error) => notifyApiError(error, 'خطا در دریافت لیست پرسنل'))
        .finally(() => setLoading(false));
    } else {
      setAvailablePersonnel([]);
    }
  }, [activityId, processId, activeStep]);

  useEffect(() => {
    if (activeStep >= 2) {
      personnelApi.getAll({ limit: 500, isActive: true }).then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data ?? [];
        setAllPersonnel(Array.isArray(list) ? list : []);
      }).catch(() => setAllPersonnel([]));
    }
  }, [activeStep]);

  useEffect(() => {
    if (open) {
      reset({
        orderId: defaultOrderId || '',
        processId: '',
        activityId: '',
        productId: '',
        quantity: 1,
        personnelId: '',
        notes: '',
      });
      setActiveStep(0);
      setOrderDetail(null);
      setProcesses([]);
      setActivities([]);
    }
  }, [open, reset, defaultOrderId]);

  const selectedOrderProduct = useMemo(
    () =>
      orderProductOptions.find(
        (o) => o.orderId === orderId && o.productId === productId
      ) ?? null,
    [orderProductOptions, orderId, productId]
  );

  const handleNext = () => {
    if (activeStep === 0) {
      if (!orderId || !productId) {
        toast.error('لطفاً یک محصول از لیست سفارش‌های در حال انجام انتخاب کنید');
        return;
      }
    }
    if (activeStep === 1) {
      if (!processId || !activityId) {
        toast.error('لطفاً فرایند و فعالیت را انتخاب کنید');
        return;
      }
      if (!watch('quantity') || watch('quantity') < 1) {
        toast.error('تعداد انجام را وارد کنید');
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const createData: CreateAssignmentDto = {
        orderId: data.orderId,
        productId: data.productId,
        activityId: data.activityId,
        quantity: data.quantity,
        personnelId: data.personnelId,
        notes: data.notes || undefined,
      };
      await assignmentsApi.createForOrder(createData);
      const productName =
        orderProductOptions.find(
          (o) => o.orderId === data.orderId && o.productId === data.productId
        )?.productName ?? 'محصول';
      const activityName = activities.find((a) => a.id === data.activityId)?.name ?? 'فعالیت';
      const processName = data.processId
        ? processes.find((p) => p.id === data.processId)?.name
        : undefined;
      const message =
        processName &&
        `به تعداد ${data.quantity} از ${productName} با فرایند ${processName} (${activityName}) به لیست کارها اضافه شد`;
      toast.success(
        message ||
          `به تعداد ${data.quantity} از ${productName} با فعالیت ${activityName} به لیست کارها اضافه شد`
      );
      onSuccess();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  const selectedProcess = processes.find((p) => p.id === processId);
  const selectedActivity = activities.find((a) => a.id === activityId);
  const activityUnitName = selectedActivity?.unit?.name || selectedActivity?.unit?.symbol || 'عدد';
  const personnelId = watch('personnelId');
  const otherPersonnel = allPersonnel.filter(
    (p) => !availablePersonnel.some((a) => a.id === p.id)
  );
  const selectedFromOther = personnelId && otherPersonnel.some((p) => p.id === personnelId);
  const selectedOtherPerson = otherPersonnel.find((p) => p.id === personnelId) ?? null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle>واگذاری کار جدید</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          {newAssignableCount > 0 && (
            <Alert
              severity="info"
              onClose={() => {
                if (typeof window !== 'undefined' && newAssignableKeysToAck.length > 0) {
                  const lastSeen: string[] = JSON.parse(
                    localStorage.getItem(STORAGE_KEY_LAST_SEEN) || '[]'
                  );
                  const merged = [...new Set([...lastSeen, ...newAssignableKeysToAck])];
                  localStorage.setItem(STORAGE_KEY_LAST_SEEN, JSON.stringify(merged));
                }
                setNewAssignableCount(0);
                setNewAssignableKeysToAck([]);
              }}
              sx={{ mb: 2 }}
            >
              {newAssignableCount} محصول به محصولاتی که می‌تونی واگذاری کنی اضافه شد.
            </Alert>
          )}
          <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ mb: 3 }} />

          {/* استپ ۰: انتخاب محصول از سفارش‌های در حال انجام */}
          {activeStep === 0 && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                فقط محصولات سفارش‌هایی که وضعیت در حال انجام دارند نمایش داده می‌شوند.
              </Typography>
              <Autocomplete
                options={orderProductOptions}
                getOptionLabel={(option) =>
                  `${option.productName} — سفارش ${option.orderNumber} (تعداد ${option.quantity})`
                }
                value={selectedOrderProduct}
                onChange={(_, newValue) => {
                  if (newValue) {
                    setValue('orderId', newValue.orderId);
                    setValue('productId', newValue.productId);
                  } else {
                    setValue('orderId', '');
                    setValue('productId', '');
                  }
                }}
                loading={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="انتخاب محصول از سفارش‌های در حال انجام"
                    placeholder="جستجو یا انتخاب..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Typography variant="body2">
                      {option.productName} — سفارش {option.orderNumber} (تعداد {option.quantity})
                    </Typography>
                  </Box>
                )}
              />
            </Stack>
          )}

          {/* استپ ۱: فرایند، فعالیت و مقدار انجام (بر اساس واحد فعالیت) */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Autocomplete
                options={processes}
                getOptionLabel={(option) => option.name}
                value={processes.find((p) => p.id === processId) || null}
                onChange={(_, newValue) => {
                  setValue('processId', newValue?.id || '');
                  setValue('activityId', '');
                }}
                loading={loading}
                renderInput={(params) => (
                  <TextField {...params} label="فرایند" required />
                )}
              />
              <Autocomplete
                options={activities}
                getOptionLabel={(option) => option.name}
                value={activities.find((a) => a.id === activityId) || null}
                onChange={(_, newValue) => setValue('activityId', newValue?.id || '')}
                disabled={!processId || activities.length === 0}
                loading={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="فعالیت"
                    required
                    helperText={
                      selectedActivity
                        ? `واحد سنجش فعالیت: ${activityUnitName}`
                        : 'ابتدا فرایند را انتخاب کنید'
                    }
                  />
                )}
              />
              <RHFNumberInput
                name="quantity"
                captionText={selectedActivity ? `تعداد (واحد سنجش فعالیت: ${activityUnitName})` : 'تعداد محصول'}
                min={1}
                max={selectedOrderProduct ? selectedOrderProduct.quantity : undefined}
                required
              />
              {selectedOrderProduct && (
                <Typography variant="caption" color="text.secondary">
                  تعداد این محصول در سفارش {selectedOrderProduct.orderNumber}: {selectedOrderProduct.quantity} واحد
                </Typography>
              )}
            </Stack>
          )}

          {/* استپ ۲: انتخاب پرسنل و یادداشت */}
          {activeStep === 2 && (
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                پرسنل‌های پیشنهادی (بر اساس فرایند «{selectedProcess?.name}» و فعالیت «{selectedActivity?.name}»):
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                کارمندانی که فرایند «{selectedProcess?.name}» را دارند پیشنهاد می‌شوند.
              </Typography>

              {availablePersonnel.length === 0 ? (
                <Alert severity="info">
                  هیچ کارمندی برای این فرایند تعریف نشده است. در بخش پرسنل، فرایندهای قابل انجام را تنظیم کنید.
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {availablePersonnel.map((personnel) => (
                    <Card
                      key={personnel.id}
                      sx={{
                        cursor: 'pointer',
                        border: personnelId === personnel.id ? 2 : 1,
                        borderColor: personnelId === personnel.id ? 'primary.main' : 'divider',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => setValue('personnelId', personnel.id)}
                    >
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1">
                              {personnel.firstName} {personnel.lastName}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              {personnel.hasProcessCapability && (
                                <Chip label="دارای فرایند" color="success" size="small" />
                              )}
                              {personnel.hasExperience && (
                                <Chip
                                  label={`تجربه: ${personnel.experienceCount} بار`}
                                  color="info"
                                  size="small"
                                />
                              )}
                            </Stack>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">
                              بار کاری
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {personnel.activeAssignmentCount} کار فعال
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              مجموع: {personnel.totalQuantity}
                            </Typography>
                            {availablePersonnel.length > 0 &&
                              personnel.workloadScore === Math.min(...availablePersonnel.map((p) => p.workloadScore)) && (
                                <Chip label="کمترین بار" color="success" size="small" sx={{ mt: 0.5 }} />
                              )}
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" color="text.secondary">
                انتخاب از سایر پرسنل:
              </Typography>
              <Autocomplete
                options={otherPersonnel}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                value={selectedFromOther ? selectedOtherPerson : null}
                onChange={(_, newValue) => {
                  setValue('personnelId', newValue?.id ?? '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="پرسنل"
                    placeholder="جستجو و انتخاب از بقیه پرسنل..."
                    size="small"
                  />
                )}
              />
              {selectedFromOther && (
                <Alert severity="warning" sx={{ mt: 0 }}>
                  این پرسنل در لیست پیشنهادی برای این فعالیت نیست.
                </Alert>
              )}

              <RHFTextField
                name="notes"
                label="یادداشت و توضیحات (اختیاری)"
                multiline
                rows={3}
                sx={{ mt: 2 }}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          {activeStep > 0 && <Button onClick={handleBack}>قبلی</Button>}
          {activeStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} variant="contained">
              بعدی
            </Button>
          ) : (
            <Button type="submit" variant="contained" disabled={isSubmitting || loading}>
              {isSubmitting ? 'در حال ذخیره...' : 'ثبت واگذاری'}
            </Button>
          )}
        </DialogActions>
      </Form>
    </Dialog>
  );
}
