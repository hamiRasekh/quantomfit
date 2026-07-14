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
import { productCategoriesApi } from '../api/productCategoriesApi';
import {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from '../types';

// ----------------------------------------------------------------------

const ProductCategorySchema = z.object({
  name: z.string().min(1, 'نام باید حداقل 1 کاراکتر باشد'),
  code: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductCategoryFormValues = z.infer<typeof ProductCategorySchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  category?: ProductCategory | null;
  onSuccess: () => void;
};

export function ProductCategoryFormDialog({
  open,
  onClose,
  category,
  onSuccess,
}: Props) {
  const isEdit = !!category;

  const methods = useForm<ProductCategoryFormValues>({
    resolver: zodResolver(ProductCategorySchema),
    defaultValues: {
      name: '',
      code: '',
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
      if (category) {
        reset({
          name: category.name,
          code: category.code || '',
          isActive: category.isActive,
        });
      } else {
        reset({
          name: '',
          code: '',
          isActive: true,
        });
      }
    }
  }, [open, category, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && category) {
        const updateData: UpdateProductCategoryDto = {
          name: data.name,
          code: data.code || undefined,
          isActive: data.isActive,
        };
        await productCategoriesApi.update(category.id, updateData);
        toast.success('دسته‌بندی با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateProductCategoryDto = {
          name: data.name,
          code: data.code || undefined,
          isActive: data.isActive ?? true,
        };
        await productCategoriesApi.create(createData);
        toast.success('دسته‌بندی با موفقیت ایجاد شد');
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
      <DialogTitle>{isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</DialogTitle>

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




