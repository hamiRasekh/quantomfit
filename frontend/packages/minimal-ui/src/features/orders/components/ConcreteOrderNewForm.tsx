'use client';

import * as z from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { Form, Field } from '@/components/ui/hook-form';
import { customersApi } from '@/features/customers/api/customersApi';
import { Customer } from '@/features/customers/types';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { customersCrmApi, ordersSalesApi } from '../api/ordersSalesApi';
import { CreateConcreteOrderDto, OrderInvoiceKind, UpdateOrderSalesFieldsDto } from '../types/sales';
import { ApplicationTypePicker } from './ApplicationTypePicker';
import { CONCRETE_APPLICATION_TYPES } from '../constants/concrete-application-types';
import { CONCRETE_GRADES } from '../constants/concrete-grades';
import { CONCRETE_TYPE_OPTIONS } from '../constants/concrete-types';
import { ORDER_PUMP_TYPES, PUMP_TYPE_OPTIONS } from '../constants/pump-types';
import { displayMoney } from '../utils/display';

const SLUMP_OPTIONS = [
  { value: 80, label: '۸ سانتی‌متر (خشک)' },
  { value: 100, label: '۱۰ سانتی‌متر' },
  { value: 120, label: '۱۲ سانتی‌متر (معمولی)' },
  { value: 150, label: '۱۵ سانتی‌متر' },
  { value: 180, label: '۱۸ سانتی‌متر' },
  { value: 210, label: '۲۱ سانتی‌متر (شل)' },
];

const schema = z.object({
  customerId: z.string().optional(),
  title: z.string().min(1, 'نام پروژه / سفارش الزامی است'),
  volumeM3: z.coerce.number().min(0.001, 'حجم بتن باید بزرگ‌تر از صفر باشد'),
  concreteGrade: z.string().min(1, 'رده بتن الزامی است'),
  concreteType: z.enum(['VIBRATED', 'SCC']),
  applicationType: z
    .string()
    .refine((v) => CONCRETE_APPLICATION_TYPES.includes(v as (typeof CONCRETE_APPLICATION_TYPES)[number]), {
      message: 'انتخاب نوع کاربرد الزامی است',
    }),
  slumpMm: z.coerce.number().min(0).optional(),
  pumpType: z.enum(['GROUND', 'AERIAL', 'OTHER', '']).optional(),
  deliveryDate: z.string().optional(),
  destinationTitle: z.string().min(1, 'نام محل تحویل الزامی است'),
  destinationAddress: z.string().min(1, 'آدرس تحویل الزامی است'),
  projectId: z.string().optional(),
  unitPricePerM3: z.coerce.number().min(0).optional(),
  transportAmount: z.coerce.number().min(0).optional(),
  pumpingAmount: z.coerce.number().min(0).optional(),
  invoiceKind: z.enum(['proforma', 'final', 'official', 'unofficial']).optional(),
  specifications: z.string().optional(),
  note: z.string().optional(),
  prepaymentRequired: z.boolean().optional(),
  prepaymentAmount: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  isDark: boolean;
  orderId?: string;
};

function toPumpTypeFormValue(value?: string | null): '' | (typeof ORDER_PUMP_TYPES)[number] {
  if (value === 'GROUND' || value === 'AERIAL' || value === 'OTHER') return value;
  return '';
}

function toFormValuesFromOrder(order: {
  customerId?: string | null;
  title?: string;
  volumeM3?: number;
  concreteGrade?: string;
  concreteType?: 'SCC' | 'VIBRATED';
  applicationType?: string;
  slumpMm?: number;
  pumpType?: string | null;
  deliveryDate?: string;
  destinationTitle?: string;
  destinationAddress?: string;
  projectId?: string;
  unitPricePerM3?: number;
  transportAmount?: number;
  pumpingAmount?: number;
  invoiceKind?: OrderInvoiceKind;
  specifications?: string;
  note?: string;
  prepaymentRequired?: boolean;
  prepaymentAmount?: number;
}): FormValues {
  return {
    customerId: order.customerId ?? '',
    title: order.title ?? '',
    volumeM3: Number(order.volumeM3) || 0,
    concreteGrade: order.concreteGrade ?? 'C25',
    concreteType: order.concreteType ?? 'VIBRATED',
    applicationType: order.applicationType ?? '',
    slumpMm: order.slumpMm != null ? Number(order.slumpMm) : 120,
    pumpType: toPumpTypeFormValue(order.pumpType),
    deliveryDate: order.deliveryDate ?? '',
    destinationTitle: order.destinationTitle ?? '',
    destinationAddress: order.destinationAddress ?? '',
    projectId: order.projectId ?? '',
    unitPricePerM3: Number(order.unitPricePerM3) || 0,
    transportAmount: Number(order.transportAmount) || 0,
    pumpingAmount: Number(order.pumpingAmount) || 0,
    invoiceKind: order.invoiceKind ?? 'final',
    specifications: order.specifications ?? '',
    note: order.note ?? '',
    prepaymentRequired: order.prepaymentRequired ?? false,
    prepaymentAmount: Number(order.prepaymentAmount) || 0,
  };
}

function normalizeDeliveryValue(value?: string | null): string {
  return value?.trim() || '';
}

function buildUpdatePayload(data: FormValues, initial?: FormValues): UpdateOrderSalesFieldsDto {
  const payload: UpdateOrderSalesFieldsDto = {
    customerId: data.customerId?.trim() || undefined,
    title: data.title.trim(),
    volumeM3: Number(data.volumeM3),
    concreteGrade: data.concreteGrade.trim(),
    concreteType: data.concreteType,
    applicationType: data.applicationType as (typeof CONCRETE_APPLICATION_TYPES)[number],
    slumpMm: data.slumpMm ? Number(data.slumpMm) : undefined,
    destinationTitle: data.destinationTitle.trim(),
    destinationAddress: data.destinationAddress.trim(),
    projectId: data.projectId || undefined,
    unitPricePerM3: data.unitPricePerM3 ? Number(data.unitPricePerM3) : 0,
    transportAmount: Number(data.transportAmount || 0),
    pumpingAmount: Number(data.pumpingAmount || 0),
    invoiceKind: data.invoiceKind ?? 'final',
    specifications: data.specifications?.trim() || undefined,
    note: data.note?.trim() || undefined,
    prepaymentRequired: data.prepaymentRequired,
    prepaymentAmount: data.prepaymentRequired ? Number(data.prepaymentAmount || 0) : 0,
  };

  const nextPump = data.pumpType || '';
  const initialPump = initial?.pumpType || '';
  if (nextPump !== initialPump) {
    payload.pumpType = nextPump ? nextPump : null;
  }

  const nextDelivery = normalizeDeliveryValue(data.deliveryDate);
  const initialDelivery = normalizeDeliveryValue(initial?.deliveryDate);
  if (nextDelivery !== initialDelivery) {
    payload.deliveryDate = nextDelivery;
    payload.scheduledStartAt = nextDelivery || undefined;
  }

  return payload;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

export function ConcreteOrderNewForm({ isDark, orderId }: Props) {
  const router = useRouter();
  const basePath = useTenantBasePath();
  const isEdit = Boolean(orderId);
  const [loadingOrder, setLoadingOrder] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; title: string; address?: string }>>([]);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      customerId: '',
      title: '',
      volumeM3: 0,
      concreteGrade: 'C25',
      concreteType: 'VIBRATED',
      applicationType: '',
      slumpMm: 120,
      pumpType: '',
      deliveryDate: '',
      destinationTitle: '',
      destinationAddress: '',
      projectId: '',
      unitPricePerM3: 0,
      transportAmount: 0,
      pumpingAmount: 0,
      invoiceKind: 'final',
      specifications: '',
      note: '',
      prepaymentRequired: false,
      prepaymentAmount: 0,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = methods;

  const customerId = watch('customerId');
  const volumeM3 = watch('volumeM3');
  const unitPricePerM3 = watch('unitPricePerM3');
  const transportAmount = watch('transportAmount');
  const pumpingAmount = watch('pumpingAmount');
  const selectedCustomer = customers.find((c) => c.id === customerId) || null;

  const estimatedTotal = useMemo(() => {
    const vol = Number(volumeM3) || 0;
    const price = Number(unitPricePerM3) || 0;
    const concrete = Math.round(vol * price);
    const transport = Math.round(Number(transportAmount) || 0);
    const pumping = Math.round(Number(pumpingAmount) || 0);
    return concrete + transport + pumping;
  }, [volumeM3, unitPricePerM3, transportAmount, pumpingAmount]);

  const minDeliveryDate = useMemo(() => dayjs().startOf('day').toDate(), []);

  useEffect(() => {
    customersApi
      .getAll({ page: 1, limit: 200 })
      .then((r) => setCustomers((r.data || []).filter((c) => c.isActive)))
      .catch((error) => notifyApiError(error, 'خطا در بارگذاری مشتریان'));
  }, []);

  useEffect(() => {
    if (!orderId) return;
    setLoadingOrder(true);
    setLoadError(false);
    ordersSalesApi
      .getDetail(orderId)
      .then((detail) => {
        const order = detail.order;
        const values = toFormValuesFromOrder(order);
        setOrderNumber(order.orderNumber);
        setInitialValues(values);
        reset(values);
      })
      .catch((error) => {
        notifyApiError(error, 'خطا در بارگذاری سفارش برای ویرایش');
        setLoadError(true);
      })
      .finally(() => setLoadingOrder(false));
  }, [orderId, reset]);

  useEffect(() => {
    if (!customerId) {
      setProjects([]);
      return;
    }
    customersCrmApi
      .profile(customerId)
      .then((profile) => setProjects(profile.projects || []))
      .catch(() => setProjects([]));
  }, [customerId]);

  const onSubmit = handleSubmit(
    async (data) => {
    try {
      if (!isEdit && data.deliveryDate?.trim()) {
        const selectedDay = dayjs(data.deliveryDate).startOf('day');
        if (selectedDay.isBefore(dayjs().startOf('day'))) {
          toast.error('تاریخ تحویل نمی‌تواند قبل از امروز باشد');
          return;
        }
      }

      if (isEdit && data.deliveryDate?.trim()) {
        const nextDelivery = normalizeDeliveryValue(data.deliveryDate);
        const initialDelivery = normalizeDeliveryValue(initialValues?.deliveryDate);
        if (nextDelivery !== initialDelivery) {
          const selectedDay = dayjs(data.deliveryDate).startOf('day');
          if (selectedDay.isBefore(dayjs().startOf('day'))) {
            toast.error('تاریخ تحویل نمی‌تواند قبل از امروز باشد');
            return;
          }
        }
      }

      if (isEdit && orderId) {
        await ordersSalesApi.updateFields(orderId, buildUpdatePayload(data, initialValues ?? undefined));
        toast.success('سفارش با موفقیت به‌روزرسانی شد');
        router.push(buildTenantHref(basePath, `/orders/${orderId}`));
        return;
      }

      const payload: CreateConcreteOrderDto = {
        customerId: data.customerId?.trim() || undefined,
        title: data.title.trim(),
        volumeM3: Number(data.volumeM3),
        concreteGrade: data.concreteGrade.trim(),
        concreteType: data.concreteType,
        applicationType: data.applicationType as (typeof CONCRETE_APPLICATION_TYPES)[number],
        slumpMm: data.slumpMm ? Number(data.slumpMm) : undefined,
        pumpType: data.pumpType || undefined,
        deliveryDate: data.deliveryDate?.trim() || undefined,
        scheduledStartAt: data.deliveryDate?.trim() || undefined,
        destinationTitle: data.destinationTitle.trim(),
        destinationAddress: data.destinationAddress.trim(),
        projectId: data.projectId || undefined,
        unitPricePerM3: data.unitPricePerM3 ? Number(data.unitPricePerM3) : 0,
        transportAmount: Number(data.transportAmount || 0),
        pumpingAmount: Number(data.pumpingAmount || 0),
        invoiceKind: data.invoiceKind ?? 'final',
        specifications: data.specifications?.trim() || undefined,
        note: data.note?.trim() || undefined,
        prepaymentRequired: data.prepaymentRequired,
        prepaymentAmount: data.prepaymentRequired ? Number(data.prepaymentAmount || 0) : 0,
      };

      await ordersSalesApi.createConcrete(payload);
      toast.success('سفارش بتن با موفقیت ثبت شد');
      router.push(buildTenantHref(basePath, '/orders'));
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : null;
      const text = Array.isArray(msg) ? msg.join('، ') : msg;
      notifyApiError(
        error,
        text || (isEdit ? 'خطا در به‌روزرسانی سفارش' : 'خطا در ثبت سفارش'),
      );
    }
  },
    () => {
      toast.error('لطفاً فیلدهای الزامی را تکمیل کنید');
    },
  );

  if (isEdit && loadingOrder) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  if (isEdit && loadError) {
    return (
      <Stack spacing={2} alignItems="center" py={6}>
        <Typography color="error">سفارش یافت نشد یا بارگذاری ناموفق بود.</Typography>
        <Button variant="outlined" onClick={() => router.push(buildTenantHref(basePath, '/orders/list'))}>
          بازگشت به لیست
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader
        title={isEdit ? `ویرایش سفارش ${orderNumber}` : 'سفارش جدید بتن'}
        isDark={isDark}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <SectionTitle>اطلاعات پایه</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="customerId"
                control={control}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={customers}
                    value={selectedCustomer}
                    getOptionLabel={(option) =>
                      [option.title, option.name, option.lastname].filter(Boolean).join(' — ') ||
                      option.mobile ||
                      option.id
                    }
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    onChange={(_, value) => field.onChange(value?.id ?? '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="مشتری (اختیاری)"
                        placeholder="می‌توانید بعداً ثبت کنید"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Field.Text name="title" label="نام پروژه / عنوان سفارش" required />
            </Grid>
            {projects.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="projectId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="پروژه مشتری (اختیاری)"
                      value={field.value || ''}
                      onChange={(e) => {
                        const id = e.target.value;
                        field.onChange(id);
                        const project = projects.find((p) => p.id === id);
                        if (project?.title) setValue('destinationTitle', project.title);
                        if (project?.address) setValue('destinationAddress', project.address);
                      }}
                    >
                      <MenuItem value="">بدون پروژه</MenuItem>
                      {projects.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Controller
            name="applicationType"
            control={control}
            render={({ field, fieldState }) => (
              <ApplicationTypePicker
                value={field.value as (typeof CONCRETE_APPLICATION_TYPES)[number] | ''}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Divider sx={{ my: 3 }} />

          <SectionTitle>مشخصات بتن</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Field.Text
                name="volumeM3"
                label="حجم بتن"
                type="number"
                required
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">m³</InputAdornment>,
                    inputProps: { min: 0.001, step: 0.001 },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Field.Select name="concreteGrade" label="رده / مقاومت بتن" required>
                {CONCRETE_GRADES.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Field.Select name="concreteType" label="نوع بتن" required>
                {CONCRETE_TYPE_OPTIONS.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Field.Select name="slumpMm" label="اسلامپ">
                {SLUMP_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Field.Select name="pumpType" label="نیاز به پمپ (اختیاری)">
                <MenuItem value="">انتخاب نشده</MenuItem>
                {PUMP_TYPE_OPTIONS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <SectionTitle>زمان تحویل</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Field.DateTimePicker
                name="deliveryDate"
                label="تاریخ و ساعت تحویل (اختیاری)"
                minDate={!isEdit ? minDeliveryDate : undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: 'می‌توانید بعداً در لیست سفارشات تعیین کنید',
                  },
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <SectionTitle>محل تحویل</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Field.Text name="destinationTitle" label="نام محل / پروژه" required placeholder="مثلاً برج A — طبقه ۳" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Field.Text
                name="destinationAddress"
                label="آدرس کامل"
                required
                multiline
                rows={3}
                placeholder="استان، شهر، خیابان، پلاک، ..."
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <SectionTitle>قیمت‌گذاری</SectionTitle>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Field.NumberInput
                name="unitPricePerM3"
                label="قیمت هر متر مکعب"
                storeAsNumber
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">ریال</InputAdornment>,
                  },
                }}
                sx={{
                  '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Field.NumberInput
                name="transportAmount"
                label="کرایه حمل"
                storeAsNumber
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">ریال</InputAdornment>,
                  },
                }}
                sx={{
                  '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Field.NumberInput
                name="pumpingAmount"
                label="خدمات پمپاژ"
                storeAsNumber
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">ریال</InputAdornment>,
                  },
                }}
                sx={{
                  '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Field.Select name="invoiceKind" label="نوع فاکتور">
                <MenuItem value="proforma">پیش‌فاکتور</MenuItem>
                <MenuItem value="final">فاکتور نهایی</MenuItem>
                <MenuItem value="official">رسمی</MenuItem>
                <MenuItem value="unofficial">غیررسمی</MenuItem>
              </Field.Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography variant="body2" color="text.secondary">
                  مبلغ کل سفارش
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {displayMoney(estimatedTotal)}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="prepaymentRequired"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={!!field.value} onChange={(_, v) => field.onChange(v)} />}
                    label="نیاز به پیش‌پرداخت"
                  />
                )}
              />
            </Grid>
            {watch('prepaymentRequired') && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Field.Text
                  name="prepaymentAmount"
                  label="مبلغ پیش‌پرداخت"
                  type="number"
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">ریال</InputAdornment>,
                      inputProps: { min: 0, step: 1000 },
                    },
                  }}
                />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <SectionTitle>توضیحات سفارش</SectionTitle>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Field.Text
                name="specifications"
                label="درخواست / توضیحات مشتری (اختیاری)"
                multiline
                rows={3}
                placeholder="هر توضیحی که مشتری درباره سفارش گفته..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Field.Text name="note" label="یادداشت داخلی" multiline rows={2} />
            </Grid>
          </Grid>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
          <Button
            color="inherit"
            variant="outlined"
            onClick={() =>
              router.push(
                buildTenantHref(basePath, isEdit && orderId ? `/orders/${orderId}` : '/orders/list'),
              )
            }
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {isSubmitting ? 'در حال ذخیره...' : isEdit ? 'ذخیره تغییرات' : 'ثبت سفارش بتن'}
          </Button>
        </Stack>
      </Form>
    </Stack>
  );
}
