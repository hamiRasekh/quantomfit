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

import { toast } from 'sonner';
import { Form, RHFSelect, RHFNumberInput } from '@/components/ui/hook-form';
import { RHFDateTimePicker } from '@/components/ui/hook-form/rhf-date-picker';
import { activityRecordsApi } from '../api/activityRecordsApi';
import { CreateActivityRecordDto } from '../types';
import { personnelApi } from '@/features/personnel/api/personnelApi';
import { productsApi } from '@/features/products/api/productsApi';
import { activitiesApi } from '@/features/activities/api/activitiesApi';
import { assignmentsApi } from '@/features/assignments/api/assignmentsApi';
import { workCalendarApi } from '@/features/work-calendar/api/workCalendarApi';
import { Personnel } from '@/features/personnel/types';
import { Product } from '@/features/products/types';
import { Activity } from '@/features/activities/types';
import { Assignment } from '@/features/assignments/types';
import { WorkCalendarSettings } from '@/features/work-calendar/types';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

// Simple schema - detailed validation is done in backend
const createActivityRecordSchema = z
  .object({
    assignmentId: z.string().optional(),
    personnelId: z.string().min(1, 'پرسنل الزامی است'),
    productId: z.string().min(1, 'محصول الزامی است'),
    activityId: z.string().min(1, 'فعالیت الزامی است'),
    quantityDone: z.number().int().min(0, 'تعداد انجام شده باید عدد صحیح و غیرمنفی باشد'),
    startedAt: z.any(),
    endedAt: z.any(),
  })
  .refine((data) => data.endedAt && data.startedAt && dayjs(data.endedAt).isAfter(dayjs(data.startedAt)), {
    message: 'زمان پایان باید بعد از زمان شروع باشد',
    path: ['endedAt'],
  });

type ActivityRecordFormValues = z.infer<typeof createActivityRecordSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function ActivityRecordFormDialog({ open, onClose, onSuccess }: Props) {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [workCalendarSettings, setWorkCalendarSettings] = useState<WorkCalendarSettings | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const methods = useForm<ActivityRecordFormValues>({
    resolver: zodResolver(createActivityRecordSchema),
    defaultValues: {
      assignmentId: '',
      personnelId: '',
      productId: '',
      activityId: '',
      quantityDone: 0,
      startedAt: dayjs(),
      endedAt: dayjs().add(1, 'hour'),
    },
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const selectedPersonnelId = watch('personnelId');
  const selectedProductId = watch('productId');
  const selectedAssignmentId = watch('assignmentId');

  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        try {
          setLoadingOptions(true);
          const [personnelRes, productsRes, calendarSettings] = await Promise.all([
            personnelApi.getAll({ limit: 100, isActive: true }),
            productsApi.getAll({ limit: 100, isActive: true }),
            workCalendarApi.getSettings().catch(() => null),
          ]);
          setPersonnel(personnelRes.data);
          setProducts(productsRes.data);
          setWorkCalendarSettings(calendarSettings);
        } catch (error) {
          toast.error('خطا در دریافت اطلاعات');
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [open]);

  // Fetch assignments when personnel changes
  useEffect(() => {
    if (selectedPersonnelId) {
      const fetchAssignments = async () => {
        try {
          const response = await assignmentsApi.getAll({
            personnelId: selectedPersonnelId,
            status: 'ASSIGNED' as any,
            limit: 100,
          });
          setAssignments(response.data);
        } catch (error) {
          // Silently fail
        }
      };
      fetchAssignments();
    } else {
      setAssignments([]);
    }
  }, [selectedPersonnelId]);

  // Fetch activities when product changes
  useEffect(() => {
    if (selectedProductId) {
      const fetchActivities = async () => {
        try {
          const response = await activitiesApi.getAll({
            limit: 100,
            isActive: true,
          });
          setActivities(response.data);
        } catch (error) {
          // Silently fail
        }
      };
      fetchActivities();
    } else {
      setActivities([]);
    }
  }, [selectedProductId]);

  // Auto-fill from assignment
  useEffect(() => {
    if (selectedAssignmentId) {
      const assignment = assignments.find((a) => a.id === selectedAssignmentId);
      if (assignment) {
        methods.setValue('productId', assignment.productId);
        methods.setValue('activityId', assignment.activityId);
      }
    }
  }, [selectedAssignmentId, assignments, methods]);

  useEffect(() => {
    if (open) {
      reset({
        assignmentId: '',
        personnelId: '',
        productId: '',
        activityId: '',
        quantityDone: 0,
        startedAt: dayjs(),
        endedAt: dayjs().add(1, 'hour'),
      });
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const createData: CreateActivityRecordDto = {
        assignmentId: data.assignmentId || undefined,
        personnelId: data.personnelId,
        productId: data.productId,
        activityId: data.activityId,
        quantityDone: data.quantityDone,
        startedAt: dayjs(data.startedAt).toISOString(),
        endedAt: dayjs(data.endedAt).toISOString(),
      };
      await activityRecordsApi.create(createData);
      toast.success('ثبت فعالیت با موفقیت انجام شد');
      onSuccess();
    } catch (error: any) {
      // Backend will validate work calendar - show appropriate error message
      const errorMessage = error.message || 'خطا در ذخیره اطلاعات';
      if (errorMessage.includes('ساعات کاری') || errorMessage.includes('تقویم')) {
        toast.error('ثبت فعالیت در خارج از ساعات کاری تعریف شده امکان‌پذیر نیست. لطفاً تقویم کاری را بررسی کنید.');
      } else {
        toast.error(errorMessage);
      }
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
      <DialogTitle>ثبت فعالیت (Timesheet)</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFSelect
              name="personnelId"
              label="پرسنل"
              required
              disabled={loadingOptions}
            >
              <MenuItem value="">انتخاب کنید</MenuItem>
              {personnel.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </MenuItem>
              ))}
            </RHFSelect>

            {selectedPersonnelId && assignments.length > 0 && (
              <RHFSelect name="assignmentId" label="واگذاری (اختیاری)">
                <MenuItem value="">بدون واگذاری</MenuItem>
                {assignments.map((assignment) => (
                  <MenuItem key={assignment.id} value={assignment.id}>
                    {assignment.product?.code} - {assignment.activity?.name} (تعداد: {assignment.quantity})
                  </MenuItem>
                ))}
              </RHFSelect>
            )}

            <RHFSelect
              name="productId"
              label="محصول"
              required
              disabled={loadingOptions || !!selectedAssignmentId}
            >
              <MenuItem value="">انتخاب کنید</MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name="activityId"
              label="فعالیت"
              required
              disabled={loadingOptions || !selectedProductId || activities.length === 0 || !!selectedAssignmentId}
            >
              <MenuItem value="">ابتدا محصول را انتخاب کنید</MenuItem>
              {activities.map((activity) => (
                <MenuItem key={activity.id} value={activity.id}>
                  {activity.name} {activity.code ? `(${activity.code})` : ''}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFNumberInput name="quantityDone" captionText="تعداد انجام شده (عدد صحیح)" min={0} step={1} />

            <RHFDateTimePicker name="startedAt" slotProps={{ textField: { label: 'زمان شروع' } }} />

            <RHFDateTimePicker name="endedAt" slotProps={{ textField: { label: 'زمان پایان' } }} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || loadingOptions}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

