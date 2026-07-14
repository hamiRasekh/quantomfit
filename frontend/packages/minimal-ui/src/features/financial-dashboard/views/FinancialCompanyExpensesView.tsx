'use client';

import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';

type Props = { isDark: boolean };

const EXAMPLE_CATEGORIES = [
  'تعمیر و سرویس خودرو',
  'لوازم اداری و مصرفی',
  'پذیرایی و ناهار پرسنل',
  'وسایل خریدنی شرکت',
];

export function FinancialCompanyExpensesView({ isDark }: Props) {
  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="هزینه‌های جانبی شرکت"
        subtitle="خریدها و هزینه‌های غیرمرتبط با تولید بتن — این موارد در بخش مواد اولیه ثبت نمی‌شوند."
        isDark={isDark}
      />

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        بخش مواد اولیه فقط کتابخانه متریال تولید بتن است. هر خرید یا هزینه‌ای که به مصالح تولید ربط
        ندارد، در این بخش مالی ثبت می‌شود.
      </Alert>

      <Card sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>نمونه دسته‌های هزینه</Typography>
        <Stack spacing={0.75}>
          {EXAMPLE_CATEGORIES.map((item) => (
            <Typography key={item} sx={{ fontSize: 14, opacity: 0.85 }}>
              • {item}
            </Typography>
          ))}
        </Stack>
        <Typography sx={{ fontSize: 13, opacity: 0.65, mt: 2 }}>
          ثبت جزئیات هزینه‌های جانبی در نسخه‌های بعدی تکمیل می‌شود.
        </Typography>
      </Card>
    </Stack>
  );
}
