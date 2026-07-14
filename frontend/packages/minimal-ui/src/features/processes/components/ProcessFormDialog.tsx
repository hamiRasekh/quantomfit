'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFCheckbox } from '@/components/ui/hook-form';
import { processesApi } from '../api/processesApi';
import { Process, CreateProcessDto, UpdateProcessDto } from '../types';

// ----------------------------------------------------------------------

const ProcessSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد'),
  code: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProcessFormValues = z.infer<typeof ProcessSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  process?: Process | null;
  onSuccess: () => void;
};

export function ProcessFormDialog({ open, onClose, process, onSuccess }: Props) {
  const isEdit = !!process;

  const methods = useForm<ProcessFormValues>({
    resolver: zodResolver(ProcessSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isActive: true,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      if (process) {
        reset({
          name: process.name,
          code: process.code || '',
          description: process.description || '',
          isActive: process.isActive,
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, process, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && process) {
        const updateData: UpdateProcessDto = {
          name: data.name,
          code: data.code || undefined,
          description: data.description || undefined,
          isActive: data.isActive,
        };
        await processesApi.update(process.id, updateData);
        toast.success('فرآیند با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateProcessDto = {
          name: data.name,
          code: data.code || undefined,
          description: data.description || undefined,
          isActive: data.isActive ?? true,
        };
        await processesApi.create(createData);
        toast.success('فرآیند با موفقیت ایجاد شد');
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
      <DialogTitle>{isEdit ? 'ویرایش فرآیند' : 'فرآیند جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFTextField name="name" label="نام فرآیند" required />
            <RHFTextField name="code" label="کد (اختیاری)" />
            <RHFTextField
              name="description"
              label="توضیحات (اختیاری)"
              multiline
              rows={3}
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




