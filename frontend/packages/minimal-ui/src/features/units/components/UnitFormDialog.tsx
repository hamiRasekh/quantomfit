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
import { unitsApi } from '../api/unitsApi';
import { Unit, CreateUnitDto, UpdateUnitDto } from '../types';

// ----------------------------------------------------------------------

const UnitSchema = z.object({
  name: z.string().min(1, 'نام باید حداقل 1 کاراکتر باشد'),
  symbol: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type UnitFormValues = z.infer<typeof UnitSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  unit?: Unit | null;
  onSuccess: () => void;
};

export function UnitFormDialog({ open, onClose, unit, onSuccess }: Props) {
  const isEdit = !!unit;

  const methods = useForm<UnitFormValues>({
    resolver: zodResolver(UnitSchema),
    defaultValues: {
      name: '',
      symbol: '',
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
      if (unit) {
        reset({
          name: unit.name,
          symbol: unit.symbol || '',
          description: unit.description || '',
          isActive: unit.isActive,
        });
      } else {
        reset({
          name: '',
          symbol: '',
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, unit, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && unit) {
        const updateData: UpdateUnitDto = {
          name: data.name,
          symbol: data.symbol || undefined,
          description: data.description || undefined,
          isActive: data.isActive,
        };
        await unitsApi.update(unit.id, updateData);
        toast.success('واحد با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateUnitDto = {
          name: data.name,
          symbol: data.symbol || undefined,
          description: data.description || undefined,
          isActive: data.isActive ?? true,
        };
        await unitsApi.create(createData);
        toast.success('واحد با موفقیت ایجاد شد');
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
      <DialogTitle>{isEdit ? 'ویرایش واحد' : 'واحد جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFTextField name="name" label="نام واحد" required />
            <RHFTextField name="symbol" label="نماد (اختیاری)" />
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




