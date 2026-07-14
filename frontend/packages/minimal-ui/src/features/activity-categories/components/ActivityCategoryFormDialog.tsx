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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFCheckbox } from '@/components/ui/hook-form';
import { Controller } from 'react-hook-form';
import { activityCategoriesApi } from '../api/activityCategoriesApi';
import { activitiesApi } from '@/features/activities/api/activitiesApi';
import { Activity } from '@/features/activities/types';
import {
  ActivityCategory,
  CreateActivityCategoryDto,
  UpdateActivityCategoryDto,
} from '../types';

// ----------------------------------------------------------------------

const ActivityCategorySchema = z.object({
  name: z.string().min(1, 'نام باید حداقل 1 کاراکتر باشد'),
  code: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  activityIds: z.array(z.string()).optional(),
});

type ActivityCategoryFormValues = z.infer<typeof ActivityCategorySchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  category?: ActivityCategory | null;
  onSuccess: () => void;
};

export function ActivityCategoryFormDialog({
  open,
  onClose,
  category,
  onSuccess,
}: Props) {
  const isEdit = !!category;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const methods = useForm<ActivityCategoryFormValues>({
    resolver: zodResolver(ActivityCategorySchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isActive: true,
      activityIds: [],
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
      const fetchActivities = async () => {
        try {
          setLoadingActivities(true);
          const response = await activitiesApi.getAll({
            limit: 500,
            isActive: true,
          });
          setActivities(Array.isArray(response) ? response : response.data);
        } catch (error) {
          toast.error('خطا در دریافت لیست فعالیت‌ها');
        } finally {
          setLoadingActivities(false);
        }
      };
      fetchActivities();
    }
  }, [open]);

  useEffect(() => {
    if (open && !loadingActivities) {
      if (category) {
        reset({
          name: category.name,
          code: category.code || '',
          description: category.description || '',
          isActive: category.isActive,
          activityIds: category.activities?.map((a) => a.id) ?? [],
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          isActive: true,
          activityIds: [],
        });
      }
    }
  }, [open, category, reset, loadingActivities]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && category) {
        const updateData: UpdateActivityCategoryDto = {
          name: data.name,
          code: data.code || undefined,
          description: data.description || undefined,
          isActive: data.isActive,
          activityIds: data.activityIds?.length ? data.activityIds : undefined,
        };
        await activityCategoriesApi.update(category.id, updateData);
        toast.success('دسته‌بندی فعالیت با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateActivityCategoryDto = {
          name: data.name,
          code: data.code || undefined,
          description: data.description || undefined,
          isActive: data.isActive ?? true,
          activityIds: data.activityIds?.length ? data.activityIds : undefined,
        };
        await activityCategoriesApi.create(createData);
        toast.success('دسته‌بندی فعالیت با موفقیت ایجاد شد');
      }
      onSuccess();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  const selectedActivities = activities.filter((a) =>
    methods.watch('activityIds')?.includes(a.id)
  );

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
      <DialogTitle>{isEdit ? 'ویرایش دسته‌بندی فعالیت' : 'دسته‌بندی فعالیت جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFTextField name="name" label="نام دسته‌بندی" required />
            <RHFTextField
              name="code"
              label="کد (اختیاری)"
              slotProps={{
                input: {
                  sx: { fontFamily: 'monospace' },
                },
              }}
            />
            <RHFTextField
              name="description"
              label="توضیحات"
              multiline
              rows={3}
            />

            <Controller
              name="activityIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={activities}
                  value={selectedActivities}
                  getOptionLabel={(option) =>
                    `${option.name}${option.code ? ` (${option.code})` : ''}`
                  }
                  onChange={(_, newValue) => field.onChange(newValue.map((a) => a.id))}
                  disabled={loadingActivities}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="فعالیت‌های این دسته‌بندی (اختیاری)"
                      placeholder="انتخاب فعالیت‌ها..."
                      size="small"
                    />
                  )}
                />
              )}
            />

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
