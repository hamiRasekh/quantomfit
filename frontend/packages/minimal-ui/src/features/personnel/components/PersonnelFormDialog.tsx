'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';

import dayjs, { Dayjs } from 'dayjs';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFDatePicker, RHFCheckbox, RHFSelect, RHFNumberInput, RHFMultiSelect } from '@/components/ui/hook-form';
import { personnelApi } from '../api/personnelApi';
import { Personnel, CreatePersonnelDto, UpdatePersonnelDto, SalaryType } from '../types';
import { positionsApi } from '@/features/positions/api/positionsApi';
import { processesApi } from '@/features/processes/api/processesApi';
import { Position } from '@/features/positions/types';
import { Process } from '@/features/processes/types';

// ----------------------------------------------------------------------

const PersonnelSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل 2 کاراکتر باشد'),
  nationalId: z.string().optional(),
  mobile: z.string().min(10, 'شماره موبایل معتبر نیست'),
  startDate: z.any().optional(),
  isActive: z.boolean().optional(),
  positionId: z.string().optional(),
  salaryType: z.nativeEnum(SalaryType).optional(),
  baseSalary: z.number().int().min(0, 'حقوق پایه (ریال) باید عدد صحیح باشد').optional(),
  overtimeMultiplier: z.number().int().min(1, 'ضریب × 100 (۱۰۰ = ۱)').max(1000).optional(),
  processIds: z.array(z.string()).optional(),
  loginPassword: z.string().min(4, 'رمز باید حداقل 4 کاراکتر باشد').optional(),
});

type PersonnelFormValues = z.infer<typeof PersonnelSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  personnel?: Personnel | null;
  onSuccess: () => void;
};

export function PersonnelFormDialog({ open, onClose, personnel, onSuccess }: Props) {
  const isEdit = !!personnel;
  const [positions, setPositions] = useState<Position[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingProcesses, setLoadingProcesses] = useState(false);

  const methods = useForm<PersonnelFormValues>({
    resolver: zodResolver(PersonnelSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nationalId: '',
      mobile: '',
      startDate: '',
      isActive: true,
      positionId: '',
      salaryType: SalaryType.MONTHLY,
      baseSalary: 0,
      overtimeMultiplier: 100,
      processIds: [],
      loginPassword: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      if (personnel) {
        reset({
          firstName: personnel.firstName,
          lastName: personnel.lastName,
          nationalId: personnel.nationalId || '',
          mobile: personnel.mobile,
          startDate: personnel.startDate ? dayjs(personnel.startDate) : null,
          isActive: personnel.isActive,
          positionId: personnel.positionId || '',
          salaryType: personnel.salaryType || SalaryType.MONTHLY,
          baseSalary: personnel.baseSalary ?? 0,
          overtimeMultiplier: personnel.overtimeMultiplier ?? 100,
          processIds: personnel.processes?.map((p) => p.id) || [],
          loginPassword: '',
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          nationalId: '',
          mobile: '',
          startDate: null,
          isActive: true,
          positionId: '',
          salaryType: SalaryType.MONTHLY,
          baseSalary: 0,
          overtimeMultiplier: 100,
          processIds: [],
          loginPassword: '',
        });
      }
    }
  }, [open, personnel, reset]);

  useEffect(() => {
    if (!open) return;
    const loadOptions = async () => {
      try {
        setLoadingPositions(true);
        setLoadingProcesses(true);
        const [positionsRes, processesRes] = await Promise.all([
          positionsApi.getAll({
            limit: 100,
            isActive: true,
          }),
          processesApi.getAll({
            limit: 100,
            isActive: true,
          }),
        ]);
        setPositions(positionsRes.data);
        setProcesses(Array.isArray(processesRes) ? processesRes : processesRes.data);
      } catch {
        toast.error('خطا در دریافت لیست سمت‌ها یا فرآیندها');
      } finally {
        setLoadingPositions(false);
        setLoadingProcesses(false);
      }
    };
    loadOptions();
  }, [open]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Convert Dayjs to ISO string for backend
      const startDateStr = data.startDate
        ? (dayjs.isDayjs(data.startDate)
            ? data.startDate.format('YYYY-MM-DD')
            : typeof data.startDate === 'string'
            ? data.startDate
            : undefined)
        : undefined;

      if (isEdit && personnel) {
        const updateData: UpdatePersonnelDto = {
          firstName: data.firstName,
          lastName: data.lastName,
          nationalId: data.nationalId || undefined,
          mobile: data.mobile,
          startDate: startDateStr,
          isActive: data.isActive,
          positionId: data.positionId || undefined,
          salaryType: data.salaryType,
          baseSalary: data.baseSalary,
          overtimeMultiplier: data.overtimeMultiplier,
          processIds: data.processIds && data.processIds.length > 0 ? data.processIds : undefined,
          loginPassword: data.loginPassword || undefined,
        };
        await personnelApi.update(personnel.id, updateData);
        toast.success('کارمند با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreatePersonnelDto = {
          firstName: data.firstName,
          lastName: data.lastName,
          nationalId: data.nationalId || undefined,
          mobile: data.mobile,
          startDate: startDateStr,
          isActive: data.isActive ?? true,
          positionId: data.positionId || undefined,
          salaryType: data.salaryType || SalaryType.MONTHLY,
          baseSalary: data.baseSalary || 0,
          overtimeMultiplier: data.overtimeMultiplier ?? 100,
          processIds: data.processIds && data.processIds.length > 0 ? data.processIds : undefined,
          loginPassword: data.loginPassword || undefined,
        };
        await personnelApi.create(createData);
        toast.success('کارمند با موفقیت ایجاد شد');
      }
      onSuccess();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' },
      }}
    >
      <DialogTitle>{isEdit ? 'ویرایش کارمند' : 'کارمند جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ typography: 'subtitle2', mb: 1, color: 'text.secondary' }}>
              اطلاعات شخصی
            </Box>
            <RHFTextField name="firstName" label="نام" required />
            <RHFTextField name="lastName" label="نام خانوادگی" required />
            <RHFTextField name="nationalId" label="کد ملی (اختیاری)" />
            <RHFTextField name="mobile" label="شماره موبایل" required />
            <RHFTextField
              name="loginPassword"
              label={isEdit ? 'رمز ورود جدید (اختیاری)' : 'رمز ورود پرسنل'}
              type="password"
              autoComplete="new-password"
              helperText={isEdit ? 'در صورت خالی بودن، رمز قبلی حفظ می‌شود' : 'حداقل 4 کاراکتر'}
            />
            <RHFDatePicker name="startDate" label="تاریخ شروع همکاری (اختیاری)" />

            <Box sx={{ typography: 'subtitle2', mb: 1, mt: 2, color: 'text.secondary' }}>
              اطلاعات سازمانی
            </Box>
            <RHFSelect
              name="positionId"
              label="سمت (اختیاری)"
              disabled={loadingPositions}
            >
              <MenuItem value="">انتخاب کنید</MenuItem>
              {positions.map((position) => (
                <MenuItem key={position.id} value={position.id}>
                  {position.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFMultiSelect
              name="processIds"
              label="فرایندهای قابل انجام (اختیاری)"
              placeholder="فرایندها را انتخاب کنید"
              options={processes.map((p) => ({ label: p.name, value: p.id }))}
              checkbox
              chip
              disabled={loadingProcesses}
              helperText="فرایندهایی که این کارمند قادر به انجام آن‌هاست؛ در واگذاری کار، بر اساس فرایند انتخابی همین افراد پیشنهاد می‌شوند"
            />

            <Box sx={{ typography: 'subtitle2', mb: 1, mt: 2, color: 'text.secondary' }}>
              اطلاعات حقوق و دستمزد
            </Box>
            <RHFSelect
              name="salaryType"
              label="نوع حقوق"
              required
            >
              <MenuItem value={SalaryType.MONTHLY}>ماهانه</MenuItem>
              <MenuItem value={SalaryType.DAILY}>روزانه</MenuItem>
              <MenuItem value={SalaryType.HOURLY}>ساعتی</MenuItem>
            </RHFSelect>
            <RHFNumberInput
              name="baseSalary"
              label="حقوق پایه"
              captionText="مبلغ حقوق پایه (ریال، عدد صحیح)"
              required
              min={0}
              step={1}
            />
            <RHFNumberInput
              name="overtimeMultiplier"
              label="ضریب اضافه‌کاری (× 100)"
              captionText="۱۰۰ = ۱، ۱۵۰ = ۱.۵ (عدد صحیح)"
              min={1}
              max={1000}
              step={1}
            />

            <Box sx={{ typography: 'subtitle2', mb: 1, mt: 2, color: 'text.secondary' }}>
              وضعیت
            </Box>
            <RHFCheckbox name="isActive" label="فعال" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

