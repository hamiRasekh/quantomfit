'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFCheckbox } from '@/components/ui/hook-form';
import { Position, CreatePositionDto, UpdatePositionDto } from '../types';
import { positionsApi } from '../api/positionsApi';

// ----------------------------------------------------------------------

const PositionSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  code: z.string().max(50, 'کد حداکثر ۵۰ کاراکتر'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type PositionFormValues = z.infer<typeof PositionSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  position?: Position | null;
};

export function PositionFormDialog({ open, onClose, onSuccess, position }: Props) {
  const isEdit = Boolean(position);

  const methods = useForm<PositionFormValues>({
    resolver: zodResolver(PositionSchema),
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
      if (position) {
        reset({
          name: position.name,
          code: position.code || '',
          description: position.description || '',
          isActive: position.isActive,
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
  }, [open, position, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: CreatePositionDto | UpdatePositionDto = {
        name: data.name,
        code: data.code || undefined,
        description: data.description || undefined,
        isActive: data.isActive,
      };

      if (isEdit && position) {
        await positionsApi.update(position.id, payload);
        toast.success('سمت با موفقیت ویرایش شد');
      } else {
        await positionsApi.create(payload as CreatePositionDto);
        toast.success('سمت جدید ایجاد شد');
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
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle>{isEdit ? 'ویرایش سمت' : 'سمت جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFTextField name="name" label="عنوان سمت" required />
            <RHFTextField name="code" label="کد (اختیاری)" />
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
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}


