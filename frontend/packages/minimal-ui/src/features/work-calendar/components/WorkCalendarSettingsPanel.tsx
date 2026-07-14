'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { v4 as uuidv4 } from 'uuid';
import { toJalaali, toGregorian, isValidJalaaliDate } from 'jalaali-js';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { Iconify } from '@/components/ui/iconify';
import { Scrollbar } from '@/components/ui/scrollbar';
import { EmptyContent } from '@/components/ui/empty-content';
import { DashboardContent } from '@/components/ui/layouts/dashboard/content';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';
import { ConfirmDialog } from '@/components/ui/custom-dialog';
import {
  TableHeadCustom,
  TableSkeleton,
  TablePaginationCustom,
} from '@/components/ui/table';
import {
  FormProvider,
  RHFCheckbox,
  RHFSelect,
  RHFTimePicker,
  RHFTextField,
} from '@/components/ui/hook-form';

import { workCalendarApi } from '@/features/work-calendar/api/workCalendarApi';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import MiniErpDashboardLayout from '@/components/ui/layouts/dashboard/mini-erp-dashboard-layout';
import {
  WorkCalendarSettings,
  WorkDay,
  UpdateWorkCalendarSettingsDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  WorkShiftTemplate,
  WorkDayShift,
} from '@/features/work-calendar/types';
import { paths } from '@/shared/routes/paths';

dayjs.extend(customParseFormat);

type WorkCalendarSettingsPanelProps = {
  variant?: 'erp' | 'tenant';
  isDark?: boolean;
  accentColor?: string;
};

// ----------------------------------------------------------------------

const TIME_FORMAT = 'HH:mm';

const SettingsSchema = z.object({
  isValidationEnabled: z.boolean(),
  workStartTime: z.any().nullable().optional(),
  workEndTime: z.any().nullable().optional(),
  weekStartDay: z.number().min(0).max(6).optional(),
});

const WeeklyShiftSchema = z
  .object({
    id: z.string().optional(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.any(),
    endTime: z.any(),
    label: z.string().max(50).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return false;
      const start = dayjs(data.startTime);
      const end = dayjs(data.endTime);
      return start.isValid() && end.isValid() && end.isAfter(start);
    },
    { message: 'بازه زمانی معتبر نیست', path: ['endTime'] },
  );

const ExceptionShiftSchema = z.object({
  id: z.string().optional(),
  startTime: z.any().nullable(),
  endTime: z.any().nullable(),
  label: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

const HolidaySchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ باید مثل 1404/10/15 باشد'),
    title: z.string().min(1, 'عنوان الزامی است'),
    isFullDayOff: z.boolean(),
    isHoliday: z.boolean(),
    note: z.string().max(200).optional(),
    shifts: z.array(ExceptionShiftSchema),
  })
  .refine(
    (data) =>
      data.isFullDayOff ||
      data.shifts.some((shift) => shift.startTime && shift.endTime && dayjs(shift.endTime).isAfter(dayjs(shift.startTime))),
    {
      path: ['shifts'],
      message: 'حداقل یک شیفت معتبر انتخاب کنید',
    },
  );

type SettingsFormValues = z.infer<typeof SettingsSchema>;
type WeeklyShiftFormValues = z.infer<typeof WeeklyShiftSchema>;
type HolidayFormValues = z.infer<typeof HolidaySchema>;

const WEEK_DAYS = [
  { value: 6, label: 'شنبه' },
  { value: 0, label: 'یکشنبه' },
  { value: 1, label: 'دوشنبه' },
  { value: 2, label: 'سه‌شنبه' },
  { value: 3, label: 'چهارشنبه' },
  { value: 4, label: 'پنج‌شنبه' },
  { value: 5, label: 'جمعه' },
];

const HOLIDAY_TABLE_HEAD = [
  { id: 'date', label: 'تاریخ (شمسی)' },
  { id: 'title', label: 'عنوان' },
  { id: 'status', label: 'وضعیت', width: 160 },
  { id: 'official', label: 'رسمی', width: 100 },
  { id: 'shifts', label: 'شیفت‌ها' },
  { id: 'note', label: 'یادداشت' },
  { id: '', width: 140 },
];

const createShiftField = () => ({
  id: uuidv4(),
  startTime: dayjs().hour(8).minute(0).second(0).format(),
  endTime: dayjs().hour(12).minute(0).second(0).format(),
  label: '',
  isActive: true,
});

const formatJalaliDate = (value: string) => {
  const parsed = dayjs(value, 'YYYY-MM-DD', true);
  if (!parsed.isValid()) return value;
  const { jy, jm, jd } = toJalaali(parsed.year(), parsed.month() + 1, parsed.date());
  const mm = String(jm).padStart(2, '0');
  const dd = String(jd).padStart(2, '0');
  return `${jy}/${mm}/${dd}`;
};

const jalaliToGregorianIso = (jalaliDate: string) => {
  const [jy, jm, jd] = jalaliDate.split('/').map((v) => Number(v));
  if (!isValidJalaaliDate(jy, jm, jd)) {
    throw new Error('تاریخ شمسی نامعتبر است');
  }
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  const mm = String(gm).padStart(2, '0');
  const dd = String(gd).padStart(2, '0');
  return `${gy}-${mm}-${dd}`;
};

const todayJalali = () => formatJalaliDate(dayjs().format('YYYY-MM-DD'));

const normalizeTimeValue = (value: any) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(TIME_FORMAT) : undefined;
};

// ----------------------------------------------------------------------

export function WorkCalendarSettingsPanel({
  variant = 'erp',
  isDark = false,
  accentColor,
}: WorkCalendarSettingsPanelProps) {
  const accent = variant === 'tenant' ? accentColor : undefined;

  const cardSx =
    variant === 'tenant'
      ? {
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
          bgcolor: isDark ? 'rgba(15,23,42,0.45)' : '#fff',
        }
      : { mb: 3 };

  const holidayDialog = useBoolean();
  const shiftDialog = useBoolean();
  const deleteHolidayDialog = useBoolean();
  const deleteShiftDialog = useBoolean();

  const [settings, setSettings] = useState<WorkCalendarSettings | null>(null);
  const [weeklyTemplate, setWeeklyTemplate] = useState<WorkShiftTemplate[]>([]);
  const [holidays, setHolidays] = useState<WorkDay[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [deletingHolidayId, setDeletingHolidayId] = useState<string | null>(null);
  const [pendingShift, setPendingShift] = useState<WorkShiftTemplate | null>(null);
  const [editingShift, setEditingShift] = useState<WorkShiftTemplate | null>(null);
  const [editingHoliday, setEditingHoliday] = useState<WorkDay | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 0,
    limit: 10,
    totalPages: 0,
  });

  const settingsMethods = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      isValidationEnabled: false,
      workStartTime: null,
      workEndTime: null,
      weekStartDay: 6,
    },
  });

  const weeklyShiftMethods = useForm<WeeklyShiftFormValues>({
    resolver: zodResolver(WeeklyShiftSchema),
    defaultValues: {
      dayOfWeek: 6,
      startTime: dayjs().hour(8).minute(0),
      endTime: dayjs().hour(12).minute(0),
      label: '',
      isActive: true,
    },
  });

  const holidayMethods = useForm<HolidayFormValues>({
    resolver: zodResolver(HolidaySchema),
    defaultValues: {
      date: todayJalali(),
      title: '',
      isFullDayOff: true,
      isHoliday: true,
      note: '',
      shifts: [createShiftField()],
    },
  });

  const { fields: shiftFields, append: appendShift, remove: removeShift, replace: replaceShifts } = useFieldArray({
    control: holidayMethods.control,
    name: 'shifts',
  });

  const fetchSettings = useCallback(async () => {
    try {
      const data = await workCalendarApi.getSettings();
      setSettings(data);
      setWeeklyTemplate(data.weeklyTemplate || []);
      settingsMethods.reset({
        isValidationEnabled: data.isValidationEnabled,
        workStartTime: data.workStartTime ? dayjs(`2000-01-01 ${data.workStartTime}`) : null,
        workEndTime: data.workEndTime ? dayjs(`2000-01-01 ${data.workEndTime}`) : null,
        weekStartDay: data.weekStartDay ?? 6,
      });
    } catch (error: any) {
      notifyApiError(error, 'خطا در دریافت تنظیمات');
    }
  }, [settingsMethods]);

  const fetchHolidays = useCallback(async () => {
    try {
      setLoadingHolidays(true);
      const response = await workCalendarApi.getAllHolidays({
        page: pagination.page + 1,
        limit: variant === 'tenant' ? Math.max(pagination.limit, 50) : pagination.limit,
      });
      setHolidays(response.data);
      setPagination({
        total: response.total,
        page: response.page - 1,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (error: any) {
      notifyApiError(error, 'خطا در دریافت تعطیلات');
    } finally {
      setLoadingHolidays(false);
    }
  }, [pagination.page, pagination.limit, variant]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const groupedWeeklyTemplate = useMemo(
    () =>
      WEEK_DAYS.map((day) => ({
        ...day,
        shifts: weeklyTemplate.filter((shift) => shift.dayOfWeek === day.value),
      })),
    [weeklyTemplate],
  );

  const handleSaveSettings = settingsMethods.handleSubmit(async (data) => {
    try {
      const updateDto: UpdateWorkCalendarSettingsDto = {
        isValidationEnabled: data.isValidationEnabled,
        workStartTime: data.workStartTime ? dayjs(data.workStartTime).format(TIME_FORMAT) : undefined,
        workEndTime: data.workEndTime ? dayjs(data.workEndTime).format(TIME_FORMAT) : undefined,
        weekStartDay: data.weekStartDay,
      };
      const updated = await workCalendarApi.updateSettings(updateDto);
      setSettings(updated);
      toast.success('تنظیمات با موفقیت ذخیره شد');
    } catch (error: any) {
      notifyApiError(error, 'ذخیره تنظیمات با خطا مواجه شد');
    }
  });

  const persistWeeklyTemplate = useCallback(
    async (template: WorkShiftTemplate[], successMessage = 'شیفت با موفقیت ذخیره شد') => {
      try {
        await workCalendarApi.updateSettings({ weeklyTemplate: template });
        setWeeklyTemplate(template);
        setSettings((prev) => (prev ? { ...prev, weeklyTemplate: template } : prev));
        toast.success(successMessage);
      } catch (error: any) {
        notifyApiError(error, 'خطا در ذخیره شیفت');
      }
    },
    [],
  );

  const handleOpenShiftDialog = (shift?: WorkShiftTemplate) => {
    setEditingShift(shift ?? null);
    weeklyShiftMethods.reset({
      id: shift?.id,
      dayOfWeek: shift?.dayOfWeek ?? WEEK_DAYS[0].value,
      startTime: shift ? dayjs(`2000-01-01 ${shift.startTime}`) : dayjs().hour(8).minute(0),
      endTime: shift ? dayjs(`2000-01-01 ${shift.endTime}`) : dayjs().hour(12).minute(0),
      label: shift?.label ?? '',
      isActive: shift?.isActive ?? true,
    });
    shiftDialog.onTrue();
  };

  const handleSaveWeeklyShift = weeklyShiftMethods.handleSubmit(async (data) => {
    const normalizedShift: WorkShiftTemplate = {
      id: data.id ?? uuidv4(),
      dayOfWeek: data.dayOfWeek,
      startTime: normalizeTimeValue(data.startTime) ?? '08:00',
      endTime: normalizeTimeValue(data.endTime) ?? '12:00',
      label: data.label?.trim() || undefined,
      isActive: data.isActive ?? true,
    };

    const nextTemplate = editingShift
      ? weeklyTemplate.map((item) => (item.id === editingShift.id ? normalizedShift : item))
      : [...weeklyTemplate, normalizedShift];

    await persistWeeklyTemplate(nextTemplate);
    shiftDialog.onFalse();
    setEditingShift(null);
  });

  const handleConfirmDeleteShift = async () => {
    if (!pendingShift) return;
    const nextTemplate = weeklyTemplate.filter((shift) => shift.id !== pendingShift.id);
    await persistWeeklyTemplate(nextTemplate, 'شیفت حذف شد');
    deleteShiftDialog.onFalse();
    setPendingShift(null);
  };

  const handleOpenHolidayDialog = (holiday?: WorkDay) => {
    if (holiday) {
      setEditingHoliday(holiday);
      holidayMethods.reset({
        date: formatJalaliDate(holiday.date),
        title: holiday.title,
        isFullDayOff: holiday.isFullDayOff,
        isHoliday: holiday.isHoliday ?? true,
        note: holiday.note || '',
        shifts:
          holiday.shifts && holiday.shifts.length > 0
            ? holiday.shifts.map((shift) => ({
                id: shift.id,
                startTime: dayjs(`2000-01-01 ${shift.startTime}`),
                endTime: dayjs(`2000-01-01 ${shift.endTime}`),
                label: shift.label || '',
                isActive: shift.isActive ?? true,
              }))
            : [createShiftField()],
      });
      replaceShifts(
        holiday.shifts && holiday.shifts.length > 0
          ? holiday.shifts.map((shift) => ({
              id: shift.id,
              startTime: dayjs(`2000-01-01 ${shift.startTime}`),
              endTime: dayjs(`2000-01-01 ${shift.endTime}`),
              label: shift.label || '',
              isActive: shift.isActive ?? true,
            }))
          : [createShiftField()],
      );
    } else {
      setEditingHoliday(null);
      holidayMethods.reset({
        date: todayJalali(),
        title: '',
        isFullDayOff: true,
        isHoliday: true,
        note: '',
        shifts: [createShiftField()],
      });
      replaceShifts([createShiftField()]);
    }
    holidayDialog.onTrue();
  };

  const handleSaveHoliday = holidayMethods.handleSubmit(async (data) => {
    const formattedShifts: WorkDayShift[] | undefined = data.isFullDayOff
      ? []
      : data.shifts
          .filter((shift) => shift.startTime && shift.endTime)
          .map((shift) => ({
            id: shift.id ?? uuidv4(),
            startTime: normalizeTimeValue(shift.startTime) ?? '08:00',
            endTime: normalizeTimeValue(shift.endTime) ?? '12:00',
            label: shift.label?.trim() || undefined,
            isActive: shift.isActive ?? true,
          }));

    const payload: CreateHolidayDto | UpdateHolidayDto = {
      date: jalaliToGregorianIso(data.date),
      title: data.title,
      isFullDayOff: data.isFullDayOff,
      isHoliday: data.isHoliday,
      note: data.note?.trim() || undefined,
      shifts: formattedShifts,
    };

    try {
      if (editingHoliday) {
        await workCalendarApi.updateHoliday(editingHoliday.id, payload);
        toast.success('استثنا ویرایش شد');
      } else {
        await workCalendarApi.createHoliday(payload as CreateHolidayDto);
        toast.success('استثنای جدید ثبت شد');
      }
      holidayDialog.onFalse();
      setEditingHoliday(null);
      fetchHolidays();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره استثنا');
    }
  });

  const handleDeleteHoliday = async () => {
    if (!deletingHolidayId) return;
    try {
      await workCalendarApi.deleteHoliday(deletingHolidayId);
      toast.success('استثنا حذف شد');
      deleteHolidayDialog.onFalse();
      setDeletingHolidayId(null);
      fetchHolidays();
    } catch (error: any) {
      notifyApiError(error, 'خطا در حذف استثنا');
    }
  };

  const watchIsFullDayOff = holidayMethods.watch('isFullDayOff');
  const watchValidationEnabled = settingsMethods.watch('isValidationEnabled');

  const handlePageChange = (_: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 0,
    }));
  };

  const content = (
    <Stack spacing={variant === 'tenant' ? 2.5 : 0}>
      {variant === 'tenant' ? (
        <TenantSubPageHeader title="تقویم کاری" isDark={isDark} />
      ) : (
        <CustomBreadcrumbs
          heading="تنظیمات تقویم کاری"
          links={[
            { name: 'داشبورد', href: paths.dashboard.root },
            { name: 'تنظیمات', href: paths.settings.root },
            { name: 'تقویم کاری' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      )}

        <Card sx={cardSx}>
          <CardHeader title="تنظیمات کلی" subheader="محدودیت ساعات کاری و روز شروع هفته (شمسی)" />
          <CardContent>
            {!watchValidationEnabled && (
              <Alert severity="info" sx={{ mb: 3 }}>
                اعتبارسنجی غیرفعال است. برای اعمال محدودیت ساعات کاری این بخش را فعال کنید.
              </Alert>
            )}

            <FormProvider methods={settingsMethods} onSubmit={handleSaveSettings}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
              >
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <RHFCheckbox
                    name="isValidationEnabled"
                    label="فعال‌سازی محدودیت ساعات کاری"
                  />
                </Box>

                <RHFTimePicker
                  name="workStartTime"
                  label="ساعت شروع پیش‌فرض"
                  disabled={!watchValidationEnabled}
                />

                <RHFTimePicker
                  name="workEndTime"
                  label="ساعت پایان پیش‌فرض"
                  disabled={!watchValidationEnabled}
                />

                <RHFSelect
                  name="weekStartDay"
                  label="روز شروع هفته"
                  disabled={!watchValidationEnabled}
                >
                  {WEEK_DAYS.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </RHFSelect>

                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={
                      variant === 'tenant' && accent
                        ? { bgcolor: accent, '&:hover': { bgcolor: accent, filter: 'brightness(0.92)' } }
                        : undefined
                    }
                  >
                    ذخیره تنظیمات
                  </Button>
                </Box>
              </Box>
            </FormProvider>
          </CardContent>
        </Card>

        <Card sx={cardSx}>
          <CardHeader
            title="شیفت‌های پیش‌فرض هفته"
            subheader="برای هر روز هفته (شنبه تا جمعه) تعداد و بازه زمانی شیفت‌ها را تعریف کنید."
            action={
              <Button
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => handleOpenShiftDialog()}
                sx={
                  variant === 'tenant' && accent
                    ? { bgcolor: accent, '&:hover': { bgcolor: accent, filter: 'brightness(0.92)' } }
                    : undefined
                }
              >
                شیفت جدید
              </Button>
            }
          />
          <CardContent>
            <Stack spacing={2}>
              {groupedWeeklyTemplate.map((day) => (
                <Box key={day.value}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Typography variant="subtitle2" sx={{ minWidth: 80 }}>
                      {day.label}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {day.shifts.length === 0 && (
                        <Chip label="شیفتی ثبت نشده" variant="outlined" color="default" />
                      )}
                      {day.shifts.map((shift) => (
                        <Box
                          key={shift.id}
                          sx={{
                            borderRadius: 1,
                            border: '1px dashed',
                            borderColor: shift.isActive === false ? 'warning.light' : 'primary.light',
                            px: 1.5,
                            py: 0.75,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {shift.startTime} - {shift.endTime}
                            {shift.label ? ` (${shift.label})` : ''}
                          </Typography>
                          {shift.isActive === false && (
                            <Chip size="small" label="غیرفعال" color="warning" variant="outlined" />
                          )}
                          <IconButton size="small" onClick={() => handleOpenShiftDialog(shift)}>
                            <Iconify icon="solar:pen-2-bold" width={18} />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setPendingShift(shift);
                              deleteShiftDialog.onTrue();
                            }}
                          >
                            <Iconify icon="solar:trash-bin-minimalistic-bold" width={18} />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={variant === 'tenant' ? { ...cardSx, mb: 0 } : undefined}>
          <CardHeader
            title="تعطیلات و روزهای استثنا"
            subheader="تعطیل کاری، تعطیل رسمی، یا شیفت ویژه برای تاریخ شمسی مشخص."
            action={
              <Button
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => handleOpenHolidayDialog()}
                sx={
                  variant === 'tenant' && accent
                    ? { bgcolor: accent, '&:hover': { bgcolor: accent, filter: 'brightness(0.92)' } }
                    : undefined
                }
              >
                ثبت روز جدید
              </Button>
            }
          />
          <Scrollbar>
            <Table>
              <TableHeadCustom headCells={HOLIDAY_TABLE_HEAD} />
              <TableBody>
                {loadingHolidays && <TableSkeleton rowCount={5} cellCount={HOLIDAY_TABLE_HEAD.length} />}

                {!loadingHolidays &&
                  holidays.map((holiday) => (
                    <TableRow key={holiday.id} hover>
                      <TableCell>{formatJalaliDate(holiday.date)}</TableCell>
                      <TableCell>{holiday.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={holiday.isFullDayOff ? 'تعطیل کامل' : 'دارای شیفت ویژه'}
                          color={holiday.isFullDayOff ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={holiday.isHoliday ? 'رسمی' : 'عادی'}
                          color={holiday.isHoliday ? 'warning' : 'default'}
                          size="small"
                          variant={holiday.isHoliday ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        {holiday.isFullDayOff && '—'}
                        {!holiday.isFullDayOff && holiday.shifts && holiday.shifts.length > 0 && (
                          <Stack direction="row" flexWrap="wrap" gap={1}>
                            {holiday.shifts.map((shift) => (
                              <Chip
                                key={shift.id}
                                size="small"
                                label={`${shift.startTime} - ${shift.endTime}${shift.label ? ` (${shift.label})` : ''}`}
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        )}
                        {!holiday.isFullDayOff && (!holiday.shifts || holiday.shifts.length === 0) && 'مطابق شیفت هفتگی'}
                      </TableCell>
                      <TableCell>{holiday.note || '-'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton color="primary" onClick={() => handleOpenHolidayDialog(holiday)}>
                            <Iconify icon="solar:pen-2-bold" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => {
                              setDeletingHolidayId(holiday.id);
                              deleteHolidayDialog.onTrue();
                            }}
                          >
                            <Iconify icon="solar:trash-bin-minimalistic-bold" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                {!loadingHolidays && holidays.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={HOLIDAY_TABLE_HEAD.length} align="center" sx={{ py: 5 }}>
                      <EmptyContent title="موردی ثبت نشده" description="استثنایی برای نمایش وجود ندارد" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Scrollbar>

          {!loadingHolidays && holidays.length > 0 && (
            <TablePaginationCustom
              count={pagination.total}
              page={pagination.page}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          )}
        </Card>

        <Dialog open={shiftDialog.value} onClose={shiftDialog.onFalse} maxWidth="xs" fullWidth>
          <DialogTitle>{editingShift ? 'ویرایش شیفت' : 'شیفت جدید'}</DialogTitle>
          <FormProvider methods={weeklyShiftMethods} onSubmit={handleSaveWeeklyShift}>
            <DialogContent>
              <Stack spacing={2}>
                <RHFSelect name="dayOfWeek" label="روز هفته">
                  {WEEK_DAYS.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFTimePicker name="startTime" label="ساعت شروع" />
                  <RHFTimePicker name="endTime" label="ساعت پایان" />
                </Stack>
                <RHFTextField name="label" label="عنوان شیفت (اختیاری)" />
                <RHFCheckbox name="isActive" label="فعال باشد" />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={shiftDialog.onFalse}>انصراف</Button>
              <Button type="submit" variant="contained">
                ذخیره
              </Button>
            </DialogActions>
          </FormProvider>
        </Dialog>

        <Dialog open={holidayDialog.value} onClose={holidayDialog.onFalse} maxWidth="md" fullWidth>
          <DialogTitle>{editingHoliday ? 'ویرایش استثنا' : 'استثنای جدید'}</DialogTitle>
          <FormProvider methods={holidayMethods} onSubmit={handleSaveHoliday}>
            <DialogContent>
              <Stack spacing={2}>
                <RHFTextField
                  name="date"
                  label="تاریخ (شمسی)"
                  placeholder="1404/10/15"
                  helperText="فرمت: YYYY/MM/DD (شمسی)"
                />
                <RHFTextField name="title" label="عنوان" required />
                <RHFCheckbox name="isFullDayOff" label="تعطیل کامل (بدون کار)" />
                <RHFCheckbox name="isHoliday" label="تعطیل رسمی / مناسبت" />
                <RHFTextField name="note" label="یادداشت" multiline minRows={2} />

                {!watchIsFullDayOff && (
                  <Stack spacing={2}>
                    {shiftFields.map((field, index) => (
                      <Box key={field.id} sx={{ border: '1px dashed', borderRadius: 1, p: 2 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                          <RHFTimePicker name={`shifts.${index}.startTime`} label="ساعت شروع" />
                          <RHFTimePicker name={`shifts.${index}.endTime`} label="ساعت پایان" />
                          <RHFTextField name={`shifts.${index}.label`} label="عنوان" />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <RHFCheckbox name={`shifts.${index}.isActive`} label="فعال" />
                          </Box>
                          <IconButton color="error" onClick={() => removeShift(index)}>
                            <Iconify icon="solar:trash-bin-minimalistic-bold" />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}

                    <Button
                      variant="outlined"
                      onClick={() => appendShift(createShiftField())}
                      startIcon={<Iconify icon="mingcute:add-line" />}
                    >
                      افزودن شیفت
                    </Button>
                  </Stack>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={holidayDialog.onFalse}>انصراف</Button>
              <Button type="submit" variant="contained">
                ذخیره
              </Button>
            </DialogActions>
          </FormProvider>
        </Dialog>

        <ConfirmDialog
          open={deleteShiftDialog.value}
          onClose={deleteShiftDialog.onFalse}
          title="حذف شیفت"
          content="آیا از حذف این شیفت مطمئن هستید؟"
          action={
            <Button variant="contained" color="error" onClick={handleConfirmDeleteShift}>
              حذف
            </Button>
          }
        />

        <ConfirmDialog
          open={deleteHolidayDialog.value}
          onClose={deleteHolidayDialog.onFalse}
          title="حذف استثنا"
          content="آیا از حذف این تاریخ مطمئن هستید؟"
          action={
            <Button variant="contained" color="error" onClick={handleDeleteHoliday}>
              حذف
            </Button>
          }
        />
    </Stack>
  );

  if (variant === 'tenant') {
    return content;
  }

  return (
    <MiniErpDashboardLayout>
      <DashboardContent>{content}</DashboardContent>
    </MiniErpDashboardLayout>
  );
}
