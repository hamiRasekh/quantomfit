'use client';

import type { ReactNode } from 'react';
import type { Breakpoint } from '@mui/material/styles';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useBoolean } from 'minimal-shared/hooks';

import { useSettingsContext } from '@/components/ui/settings';

import { useMockedUser } from '@/ui/auth/hooks';
import type { NavItemProps } from '@/components/ui/nav-section';

import { DashboardLayout } from './layout';
import { useAdminNavData } from './nav-config-admin';
import { AdminDashboardHeaderActions } from './admin-dashboard-header-actions';
import { MenuButton } from '../components/menu-button';
import { NavMobile } from './nav-mobile';
import { Logo } from '@/components/ui/logo';
import { VerticalDivider } from './content';
import { dashboardNavColorVars } from './css-vars';

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const theme = useTheme();
  const { user } = useMockedUser();
  const { state, setField } = useSettingsContext();
  const initialNavLayoutRef = useRef(state.navLayout);
  const shouldResetNavLayoutRef = useRef(false);
  const hasMountedRef = useRef(false);
  const [isReady, setIsReady] = useState(state.navLayout === 'vertical');
  const { value: isNavDrawerOpen, onFalse: handleCloseNav, onTrue: handleOpenNav } = useBoolean();

  const layoutQuery: Breakpoint = 'lg';

  const navVars = useMemo(
    () => dashboardNavColorVars(theme, 'apparent', state.navLayout),
    [state.navLayout, theme]
  );

  const isNavHorizontal = false; // Admin layout always uses vertical navigation
  const adminNavData = useAdminNavData();

  const canDisplayItemByRole = useCallback(
    (allowedRoles?: NavItemProps['allowedRoles']) => {
      if (!allowedRoles) {
        return true;
      }

      if (typeof allowedRoles === 'string') {
        return allowedRoles !== user?.role;
      }

      return !allowedRoles.includes(user?.role);
    },
    [user?.role]
  );

  useEffect(() => {
    if (hasMountedRef.current) {
      return;
    }

    hasMountedRef.current = true;

    const initialLayout = initialNavLayoutRef.current;
    const needsOverride = initialLayout !== 'vertical';
    shouldResetNavLayoutRef.current = needsOverride;

    // Only set to vertical if it's not already vertical
    // But allow it to be changed via toggle button
    if (needsOverride && state.navLayout !== 'vertical') {
      setField('navLayout', 'vertical');
    }

    setIsReady(true);

    return () => {
      if (shouldResetNavLayoutRef.current) {
        setField('navLayout', initialLayout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <DashboardLayout
      navColor="apparent"
      slotProps={{
        header: {
          slots: {
            leftArea: (
              <>
                <MenuButton
                  onClick={handleOpenNav}
                  sx={{
                    mr: 1,
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />

                <NavMobile
                  data={adminNavData}
                  open={isNavDrawerOpen}
                  onClose={handleCloseNav}
                  cssVars={navVars.section}
                  checkPermissions={canDisplayItemByRole}
                />

                {isNavHorizontal ? (
                  <>
                    <Logo
                      sx={{
                        display: 'none',
                        [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
                      }}
                    />
                    <VerticalDivider
                      sx={{ [theme.breakpoints.up(layoutQuery)]: { display: 'flex' } }}
                    />
                  </>
                ) : null}
              </>
            ),
            rightArea: <AdminDashboardHeaderActions />,
          },
          slotProps: {
            container: {
              maxWidth: false,
              sx: {
                px: { xs: 2, lg: 3 },
              },
            },
          },
        },
        nav: {
          data: adminNavData,
        },
      }}
    >
      {children}
    </DashboardLayout>
  );
}
