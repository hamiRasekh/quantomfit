'use client';

import Link from 'next/link';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import PageNotFoundIllustration from '@/components/ui/assets/illustrations/page-not-found-illustration';

export default function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        p: 2,
      }}
    >
      <PageNotFoundIllustration />
      <Typography variant="h4">صفحه یافت نشد</Typography>
      <Typography variant="body2" color="text.secondary">
        صفحه‌ای که دنبال آن هستید وجود ندارد یا حذف شده است.
      </Typography>
      <Button component={Link} href="/" variant="contained" size="large">
        بازگشت به صفحه اصلی
      </Button>
    </Box>
  );
}
