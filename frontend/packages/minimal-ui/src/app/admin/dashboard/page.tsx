'use client';

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { adminApi } from '@/features/settings/api/adminApi';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ companies: 0, admins: 0, roles: 0, permissions: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [companies, users, roles, permissions] = await Promise.all([
          adminApi.listCompanies(),
          adminApi.listUsers(),
          adminApi.listRoles(),
          adminApi.listPermissions(),
        ]);
        setStats({
          companies: companies.length,
          admins: users.length,
          roles: roles.length,
          permissions: permissions.length,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <Stack alignItems="center" py={8}><CircularProgress /></Stack>;
  }

  const cards = [
    ['شرکت‌ها', stats.companies, '#0D6EFD'],
    ['ادمین‌ها', stats.admins, '#1D4ED8'],
    ['نقش‌ها', stats.roles, '#2563EB'],
    ['دسترسی‌ها', stats.permissions, '#3B82F6'],
  ] as const;

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={800} color="primary.dark">نمای کلی سیستم</Typography>
      <Grid container spacing={2}>
        {cards.map(([label, value, color]) => (
          <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3, color: 'white', background: `linear-gradient(135deg, ${color} 0%, #0B3C9D 100%)` }}>
              <Typography sx={{ opacity: 0.92 }} variant="body2">{label}</Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 900 }}>{value}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
