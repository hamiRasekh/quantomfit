'use client';

import { AuthGuard } from '@/components/ui/auth/guard/auth-guard';
import { MuiPickersProvider } from '@/components/datepiker/MuiPickersProvider';
import { Snackbar } from '@/components/ui/snackbar';
import TenantShell from './_components/TenantShell';
import { TenantThemeProvider } from '@/features/tenant-panel/context/tenant-theme-context';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MuiPickersProvider>
        <TenantThemeProvider>
          <Snackbar />
          <TenantShell>{children}</TenantShell>
        </TenantThemeProvider>
      </MuiPickersProvider>
    </AuthGuard>
  );
}
