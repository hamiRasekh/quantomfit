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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFCheckbox, RHFSelect, RHFNumberInput } from '@/components/ui/hook-form';
import { Controller } from 'react-hook-form';
import { activitiesApi } from '../api/activitiesApi';
import { Activity, CreateActivityDto, UpdateActivityDto } from '../types';
import { processesApi } from '@/features/processes/api/processesApi';
import { unitsApi } from '@/features/units/api/unitsApi';
import { activityCategoriesApi } from '@/features/activity-categories/api/activityCategoriesApi';
import { Process } from '@/features/processes/types';
import { Unit } from '@/features/units/types';
import { ActivityCategory } from '@/features/activity-categories/types';

// ----------------------------------------------------------------------

const ActivitySchema = z.object({
  name: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد'),
  code: z.string().optional(),
  processIds: z.array(z.string()).min(1, 'حداقل یک فرایند انتخاب شود'),
  categoryIds: z.array(z.string()).optional(),
  unitId: z.string().min(1, 'واحد الزامی است'),
  standardSeconds: z.number().int().min(0, 'زمان استاندارد باید عدد صحیح و غیرمنفی باشد').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ActivityFormValues = z.infer<typeof ActivitySchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  activity?: Activity | null;
  onSuccess: () => void;
};

export function ActivityFormDialog({ open, onClose, activity, onSuccess }: Props) {
  const isEdit = !!activity;
  const [processes, setProcesses] = useState<Process[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const methods = useForm<ActivityFormValues>({
    resolver: zodResolver(ActivitySchema),
    defaultValues: {
      name: '',
      code: '',
      processIds: [],
      categoryIds: [],
      unitId: '',
      standardSeconds: undefined,
      description: '',
      isActive: true,
    },
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        try {
          setLoadingOptions(true);
          const [processesRes, unitsRes, categoriesRes] = await Promise.all([
            processesApi.getAll({ limit: 100, isActive: true }),
            unitsApi.getAll({ limit: 100, isActive: true }),
            activityCategoriesApi.getAll({ limit: 100, isActive: true }),
          ]);
          setProcesses(Array.isArray(processesRes) ? processesRes : processesRes?.data ?? []);
          setUnits(Array.isArray(unitsRes) ? unitsRes : unitsRes?.data ?? []);
          setCategories(Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data ?? []));
        } catch (error) {
          toast.error('خطا در دریافت لیست فرآیندها، واحدها یا دسته‌بندی‌ها');
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [open]);

  useEffect(() => {
    if (open && !loadingOptions) {
      if (activity) {
        reset({
          name: activity.name,
          code: activity.code || '',
          processIds: activity.processIds ?? activity.processes?.map((p) => p.id) ?? [],
          categoryIds: activity.categoryIds ?? activity.categories?.map((c) => c.id) ?? [],
          unitId: activity.unitId,
          standardSeconds: activity.standardSeconds || undefined,
          description: activity.description || '',
          isActive: activity.isActive,
        });
      } else {
        reset({
          name: '',
          code: '',
          processIds: [],
          categoryIds: [],
          unitId: '',
          standardSeconds: undefined,
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, activity, reset, loadingOptions]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && activity) {
        const updateData: UpdateActivityDto = {
          name: data.name,
          code: data.code || undefined,
          processIds: data.processIds,
          categoryIds: data.categoryIds?.length ? data.categoryIds : undefined,
          unitId: data.unitId,
          standardSeconds: data.standardSeconds,
          description: data.description || undefined,
          isActive: data.isActive,
        };
        await activitiesApi.update(activity.id, updateData);
        toast.success('فعالیت با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateActivityDto = {
          name: data.name,
          code: data.code || undefined,
          processIds: data.processIds,
          categoryIds: data.categoryIds?.length ? data.categoryIds : undefined,
          unitId: data.unitId,
          standardSeconds: data.standardSeconds,
          description: data.description || undefined,
          isActive: data.isActive ?? true,
        };
        await activitiesApi.create(createData);
        toast.success('فعالیت با موفقیت ایجاد شد');
      }
      onSuccess();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  const unitOptions = units.map((u) => ({ id: u.id, label: `${u.name}${u.symbol ? ` (${u.symbol})` : ''}` }));

  const selectedProcesses = processes.filter((p) => methods.watch('processIds')?.includes(p.id));
  const selectedCategories = categories.filter((c) => methods.watch('categoryIds')?.includes(c.id));

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
      <DialogTitle>{isEdit ? 'ویرایش فعالیت' : 'فعالیت جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFTextField name="name" label="نام فعالیت" required />
            <RHFTextField name="code" label="کد (اختیاری)" />

            <Controller
              name="processIds"
              control={control}
              render={({ field, fieldState }) => (
                <Autocomplete
                  multiple
                  options={processes}
                  value={selectedProcesses}
                  getOptionLabel={(option) => `${option.name}${option.code ? ` (${option.code})` : ''}`}
                  onChange={(_, newValue) => field.onChange(newValue.map((p) => p.id))}
                  disabled={loadingOptions}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="فرایندها (حداقل یک فرایند)"
                      placeholder="انتخاب فرایندها..."
                      size="small"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              )}
            />

            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={categories}
                  value={selectedCategories}
                  getOptionLabel={(option) => `${option.name}${option.code ? ` (${option.code})` : ''}`}
                  onChange={(_, newValue) => field.onChange(newValue.map((c) => c.id))}
                  disabled={loadingOptions}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="دسته‌بندی‌های فعالیت (اختیاری)"
                      placeholder="انتخاب دسته‌بندی‌ها..."
                      size="small"
                    />
                  )}
                />
              )}
            />

            <RHFSelect
              name="unitId"
              label="واحد"
              required
              disabled={loadingOptions}
            >
              <MenuItem value="">انتخاب کنید</MenuItem>
              {unitOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFNumberInput name="standardSeconds" captionText="زمان استاندارد (ثانیه، عدد صحیح)" min={0} step={1} />
            <RHFTextField
              name="description"
              label="توضیحات"
              multiline
              rows={3}
            />

            <RHFCheckbox name="isActive" label="فعال" />
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
