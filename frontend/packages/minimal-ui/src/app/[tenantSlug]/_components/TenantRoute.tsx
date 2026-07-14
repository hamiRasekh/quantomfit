'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useMemo, type ComponentType } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { LoadingScreen } from '@/components/ui/loading-screen';
import { usePermissions } from '@/features/rbac/hooks/usePermissions';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

function extractHrefSuffix(pathname: string, base: string): string {
  if (!base) return pathname;
  if (pathname === base) return '/dashboard';
  if (pathname.startsWith(`${base}/`)) {
    return pathname.slice(base.length);
  }
  return pathname;
}

export function TenantRoute({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const base = useTenantBasePath();
  const { loading, canViewPath } = usePermissions();

  const hrefSuffix = useMemo(() => extractHrefSuffix(pathname, base), [pathname, base]);
  const allowed = canViewPath(hrefSuffix);

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace(buildTenantHref(base, '/dashboard'));
    }
  }, [allowed, base, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!allowed) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            دسترسی مجاز نیست
          </Typography>
          <Typography color="text.secondary">
            شما مجوز مشاهده این صفحه را ندارید.
          </Typography>
          <Button variant="contained" onClick={() => router.replace(buildTenantHref(base, '/dashboard'))}>
            بازگشت به داشبورد
          </Button>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}

export function withTenantRoute<P extends object>(Page: ComponentType<P>) {
  return function TenantRoutePage(props: P) {
    return (
      <TenantRoute>
        <Page {...props} />
      </TenantRoute>
    );
  };
}
