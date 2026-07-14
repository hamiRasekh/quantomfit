'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFCheckbox } from '@/components/ui/hook-form';
import { rawMaterialCategoriesApi } from '../api/rawMaterialCategoriesApi';
import {
  CreateRawMaterialCategoryDto,
  getCategoryAttributeNames,
  isCatalogCategory,
  RawMaterialCategory,
  UpdateRawMaterialCategoryDto,
} from '../types';

const TenantSchema = z.object({
  name: z.string().min(1, 'نام دسته‌بندی الزامی است'),
  attributeName: z.string().optional(),
  isActive: z.boolean().optional(),
});

const CatalogSchema = z.object({
  isActive: z.boolean().optional(),
});

type TenantFormValues = z.infer<typeof TenantSchema>;
type CatalogFormValues = z.infer<typeof CatalogSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  category?: RawMaterialCategory | null;
  onSuccess: () => void;
};

export function RawMaterialCategoryFormDialog({ open, onClose, category, onSuccess }: Props) {
  const isEdit = !!category;
  const isCatalog = category ? isCatalogCategory(category) : false;

  const tenantMethods = useForm<TenantFormValues>({
    resolver: zodResolver(TenantSchema),
    defaultValues: { name: '', attributeName: '', isActive: true },
  });

  const catalogMethods = useForm<CatalogFormValues>({
    resolver: zodResolver(CatalogSchema),
    defaultValues: { isActive: true },
  });

  useEffect(() => {
    if (!open) return;

    if (category) {
      if (isCatalogCategory(category)) {
        catalogMethods.reset({ isActive: category.isActive });
      } else {
        tenantMethods.reset({
          name: category.name,
          attributeName: getCategoryAttributeNames(category)[0] || '',
          isActive: category.isActive,
        });
      }
      return;
    }

    tenantMethods.reset({ name: '', attributeName: '', isActive: true });
  }, [open, category, tenantMethods, catalogMethods]);

  const onSubmitTenant = tenantMethods.handleSubmit(async (data) => {
    try {
      const attributeName = data.attributeName?.trim() || undefined;

      if (isEdit && category) {
        const updateData: UpdateRawMaterialCategoryDto = {
          name: data.name,
          isActive: data.isActive,
          attributeName: attributeName ?? '',
        };
        await rawMaterialCategoriesApi.update(category.id, updateData);
        toast.success('دسته‌بندی اختصاصی با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateRawMaterialCategoryDto = {
          name: data.name,
          isActive: data.isActive ?? true,
          attributeName,
        };
        await rawMaterialCategoriesApi.create(createData);
        toast.success('دسته‌بندی اختصاصی با موفقیت ایجاد شد');
      }
      onSuccess();
    } catch (error: unknown) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  const onSubmitCatalog = catalogMethods.handleSubmit(async (data) => {
    if (!category) return;
    try {
      await rawMaterialCategoriesApi.update(category.id, { isActive: data.isActive });
      toast.success('وضعیت دسته‌بندی پایه به‌روزرسانی شد');
      onSuccess();
    } catch (error: unknown) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  const catalogAttributes = category ? getCategoryAttributeNames(category) : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle>
        {isCatalog
          ? 'مشاهده دسته‌بندی پایه'
          : isEdit
            ? 'ویرایش دسته‌بندی اختصاصی'
            : 'دسته‌بندی اختصاصی جدید'}
      </DialogTitle>

      {isCatalog && category ? (
        <Form methods={catalogMethods} onSubmit={onSubmitCatalog}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                این دسته توسط تیم اسمارت بتن تعریف شده و در طرح اختلاط استفاده می‌شود. فقط وضعیت فعال/غیرفعال
                قابل تغییر است.
              </Alert>
              <Box>
                <Typography sx={{ fontSize: 12.5, opacity: 0.65, mb: 0.35 }}>نام دسته</Typography>
                <Typography sx={{ fontWeight: 800 }}>{category.name}</Typography>
              </Box>
              {category.code ? (
                <Box>
                  <Typography sx={{ fontSize: 12.5, opacity: 0.65, mb: 0.35 }}>کد</Typography>
                  <Typography sx={{ fontFamily: 'monospace' }}>{category.code}</Typography>
                </Box>
              ) : null}
              <Box>
                <Typography sx={{ fontSize: 12.5, opacity: 0.65, mb: 0.75 }}>ویژگی‌های این دسته</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {catalogAttributes.length ? (
                    catalogAttributes.map((name) => (
                      <Typography key={name} component="span" sx={{ fontSize: 13.5, fontWeight: 700 }}>
                        {name}
                      </Typography>
                    ))
                  ) : (
                    <Typography sx={{ fontSize: 13.5, opacity: 0.7 }}>بدون ویژگی</Typography>
                  )}
                </Stack>
              </Box>
              <RHFCheckbox name="isActive" label="فعال در کتابخانه مواد شرکت" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>بستن</Button>
            <Button type="submit" variant="contained" disabled={catalogMethods.formState.isSubmitting}>
              ذخیره وضعیت
            </Button>
          </DialogActions>
        </Form>
      ) : (
        <Form methods={tenantMethods} onSubmit={onSubmitTenant}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                برای مواد خاصی که در دسته‌های پایه نیستند. این دسته‌ها در طرح اختلاط مرکزی استفاده نمی‌شوند.
              </Alert>
              <RHFTextField name="name" label="نام دسته‌بندی" required />
              <RHFTextField
                name="attributeName"
                label="نام ویژگی (اختیاری)"
                placeholder="مثلاً نوع، درجه یا مشخصه فنی"
                helperText="در صورت نیاز، همراه دسته فقط یک ویژگی تعریف می‌شود."
              />
              <RHFCheckbox name="isActive" label="فعال" />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>انصراف</Button>
            <Button type="submit" variant="contained" disabled={tenantMethods.formState.isSubmitting}>
              {tenantMethods.formState.isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </DialogActions>
        </Form>
      )}
    </Dialog>
  );
}
