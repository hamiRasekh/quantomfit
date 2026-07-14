'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFCheckbox, RHFSelect } from '@/components/ui/hook-form';
import { attributesApi } from '../api/attributesApi';
import { Attribute, AttributeType, CreateAttributeDto, UpdateAttributeDto } from '../types';

const Schema = z.object({
  name: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد'),
  type: z.enum(['select', 'number']),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof Schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  attribute?: Attribute | null;
  onSuccess: () => void;
};

const TYPE_OPTIONS: { value: AttributeType; label: string; helper: string }[] = [
  { value: 'select', label: 'انتخابی', helper: 'برای ویژگی‌هایی که با لیست مقادیر انتخاب می‌شوند.' },
  { value: 'number', label: 'عددی', helper: 'نیازی به تعریف مقدار از پیش نیست؛ هنگام ثبت ماده اولیه مقدار عددی وارد می‌شود.' },
];

export function AttributeFormDialog({ open, onClose, attribute, onSuccess }: Props) {
  const isEdit = !!attribute;

  const methods = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: '',
      type: 'select',
      isActive: true,
    },
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (!open) return;
    if (attribute) {
      reset({
        name: attribute.name,
        type: attribute.type || 'select',
        isActive: attribute.isActive,
      });
    } else {
      reset({ name: '', type: 'select', isActive: true });
    }
  }, [open, attribute, reset]);

  const selectedType = watch('type');

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && attribute) {
        const updateData: UpdateAttributeDto = {
          name: data.name,
          type: data.type,
          isActive: data.isActive,
        };
        await attributesApi.update(attribute.id, updateData);
        toast.success('ویژگی با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateAttributeDto = {
          name: data.name,
          type: data.type,
          isActive: data.isActive ?? true,
        };
        await attributesApi.create(createData);
        toast.success('ویژگی با موفقیت ایجاد شد');
      }
      onSuccess();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle>{isEdit ? 'ویرایش ویژگی' : 'ویژگی جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFTextField name="name" label="نام ویژگی" required />

            <RHFSelect name="type" label="نوع ویژگی" required>
              {TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <Box
              sx={{
                borderRadius: 2,
                p: 1.5,
                bgcolor: 'rgba(38, 99, 235, 0.06)',
                border: '1px solid rgba(38, 99, 235, 0.12)',
                color: 'text.secondary',
                fontSize: 13,
              }}
            >
              {TYPE_OPTIONS.find((item) => item.value === selectedType)?.helper}
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
