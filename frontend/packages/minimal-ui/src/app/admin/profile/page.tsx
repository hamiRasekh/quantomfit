'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { toast } from 'sonner';

import { FormProvider, RHFTextField } from '@/components/ui/hook-form';
import { adminApi } from '@/features/settings/api/adminApi';

const Schema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

type Values = z.infer<typeof Schema>;

export default function AdminProfilePage() {
  const methods = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: '', currentPassword: '', newPassword: '' },
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    (async () => {
      try {
        const profile = await adminApi.getProfile();
        reset({ email: profile.email, currentPassword: '', newPassword: '' });
      } catch (error: any) {
        toast.error(error.message || 'خطا در دریافت پروفایل');
      }
    })();
  }, [reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await adminApi.updateProfile({
        email: values.email,
        currentPassword: values.currentPassword || undefined,
        newPassword: values.newPassword || undefined,
      });
      toast.success('پروفایل با موفقیت به‌روزرسانی شد');
      reset({ ...values, currentPassword: '', newPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'خطا در به‌روزرسانی پروفایل');
    }
  });

  return (
    <Card>
      <CardHeader title="پروفایل ادمین" subheader="ایمیل و رمز عبور حساب خود را مدیریت کنید" />
      <CardContent>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2}>
            <RHFTextField name="email" label="ایمیل" />
            <RHFTextField name="currentPassword" type="password" label="رمز فعلی (برای تغییر رمز)" />
            <RHFTextField name="newPassword" type="password" label="رمز جدید" />
            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={isSubmitting}>ذخیره تغییرات</Button>
            </Stack>
          </Stack>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
