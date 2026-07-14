'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { toast } from 'sonner';

import { FormProvider, RHFTextField } from '@/components/ui/hook-form';
import { adminApi, setAdminToken } from '@/features/settings/api/adminApi';
import { BRAND_LOGO, BRAND_NAME } from '@/shared/config/brand';

const LoginSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر باشد'),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();

  const methods = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await adminApi.login(values.email, values.password);
      setAdminToken(res.accessToken);
      toast.success('ورود ادمین با موفقیت انجام شد');
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'ورود ناموفق بود');
    }
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: 'radial-gradient(circle at 20% 20%, #DCEBFF 0%, #EDF4FF 40%, #F8FBFF 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 500, border: '1px solid', borderColor: 'primary.light' }}>
        <CardHeader
          title={
            <Stack alignItems="center" spacing={1.5}>
              <Image src={BRAND_LOGO} alt={BRAND_NAME} width={120} height={120} style={{ objectFit: 'contain' }} />
              <Typography variant="h6" fontWeight={800} color="primary.main">ورود پنل مدیریت</Typography>
            </Stack>
          }
          subheader="مدیریت شرکت‌ها و کاتالوگ پایه"
          sx={{ textAlign: 'center' }}
        />
        <CardContent>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={2}>
              <RHFTextField name="email" label="ایمیل ادمین" />
              <RHFTextField name="password" type="password" label="رمز عبور ادمین" />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? 'در حال ورود...' : 'ورود به داشبورد'}
              </Button>
            </Stack>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
}
