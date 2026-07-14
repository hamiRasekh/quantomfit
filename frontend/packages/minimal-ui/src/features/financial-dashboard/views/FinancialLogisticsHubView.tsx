'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FinancialHubShell } from '../components/FinancialHubShell';
import { FinancialPageView } from '../components/FinancialPageView';
import { FINANCIAL_HUB_BY_ID } from '../constants/hubs';

type Props = { isDark: boolean };

function LogisticsPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <Stack spacing={2}>
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{title}</Typography>
        <Typography sx={{ fontSize: 13.5, lineHeight: 1.7 }}>{description}</Typography>
      </Alert>
    </Stack>
  );
}

export function FinancialLogisticsHubView({ isDark }: Props) {
  const hub = FINANCIAL_HUB_BY_ID.logistics;

  return (
    <FinancialHubShell
      hub={hub}
      isDark={isDark}
      renderTab={(tabId) => {
        if (tabId === 'fleet') {
          return <FinancialPageView pageId="fleet" isDark={isDark} variant="hub" />;
        }
        if (tabId === 'drivers') {
          return (
            <LogisticsPlaceholder
              title="صورت‌وضعیت رانندگان پیمانکار"
              description="پس از اتصال کامل ماژول ناوگان، هزینه سرویس و کرایه رانندگان پیمانکار در این بخش نمایش داده می‌شود."
            />
          );
        }
        if (tabId === 'pump') {
          return (
            <LogisticsPlaceholder
              title="کارکرد پمپ دکل / زمینی"
              description="هزینه و درآمد خدمات پمپاژ بر اساس سفارش‌ها و dispatch در این تب تجمیع خواهد شد."
            />
          );
        }
        if (tabId === 'idle-penalty') {
          return (
            <LogisticsPlaceholder
              title="جریمه معطلی پروژه"
              description="محاسبه جریمه معطلی میکسر در کارگاه مشتری در فاز بعدی به این هاب اضافه می‌شود."
            />
          );
        }
        return null;
      }}
    />
  );
}
