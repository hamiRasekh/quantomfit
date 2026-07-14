'use client';

import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';

type Props = { isDark: boolean };

export function ProductionSectionDashboard({ isDark }: Props) {
  return (
    <Stack spacing={3}>
      <TenantSubPageHeader
        title="تولید"
        subtitle="محل اتصال سیستم به PLC دستگاه اتوماسیون بچینگ پلنت — خروج مواد از انبار از این بخش همگام می‌شود."
        isDark={isDark}
      />

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        این بخش در حال آماده‌سازی است. پس از اتصال به دستگاه بچینگ، مصرف مواد (خروج انبار) به‌صورت خودکار
        از تولید ثبت می‌شود.
      </Alert>

      <Card sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2} alignItems="center" textAlign="center" py={4}>
          <Iconify icon="solar:layers-bold-duotone" width={56} sx={{ opacity: 0.55 }} />
          <Typography sx={{ fontWeight: 900, fontSize: 18 }}>اتصال PLC بچینگ پلنت</Typography>
          <Typography sx={{ fontSize: 14, opacity: 0.72, maxWidth: 520, lineHeight: 1.7 }}>
            در نسخه‌های بعدی، وضعیت خط تولید، دستورات بتن‌ریزی و ثبت خودکار خروج مصالح از انبار در این
            بخش نمایش داده می‌شود.
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
}
