'use client';

import type { ReactNode } from 'react';
import type { Breakpoint } from '@mui/material/styles';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useBoolean } from 'minimal-shared/hooks';

import { useSettingsContext } from '@/components/ui/settings';
import { useAuth } from '@/features/auth/hooks/useAuth';

import type { NavItemProps } from '@/components/ui/nav-section';

import { DashboardLayout } from './layout';
import { useMiniErpNavData } from './nav-config-mini-erp';
import { MiniErpDashboardHeaderActions } from './mini-erp-dashboard-header-actions';
import { MenuButton } from '../components/menu-button';
import { NavMobile } from './nav-mobile';
import { Logo } from '@/components/ui/logo';
import { VerticalDivider } from './content';
import { dashboardNavColorVars } from './css-vars';
import { NavUserInfo } from '../components/nav-user-info';
import { layoutClasses } from '../core';

interface MiniErpDashboardLayoutProps {
  children: ReactNode;
}

export default function MiniErpDashboardLayout({ children }: MiniErpDashboardLayoutProps) {
  const theme = useTheme();
  const { user } = useAuth();
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

  const isNavHorizontal = false; // Mini-ERP layout always uses vertical navigation
  const miniErpNavData = useMiniErpNavData();

  const canDisplayItemByRole = useCallback(
    (allowedRoles?: NavItemProps['allowedRoles']) => {
      if (!allowedRoles) {
        return true;
      }

      if (typeof allowedRoles === 'string') {
        return allowedRoles !== user?.role;
      }

      return !allowedRoles.includes(user?.role || '');
    },
    [user?.role]
  );

  useEffect(() => {
    if (hasMountedRef.current) {
      return;
    }

    hasMountedRef.current = true;

    const initialLayout = initialNavLayoutRef.current;
    const needsOverride = initialLayout === 'horizontal';
    shouldResetNavLayoutRef.current = needsOverride;

    // Force vertical or mini layout (not horizontal) for Mini-ERP
    if (state.navLayout === 'horizontal') {
      setField('navLayout', 'vertical');
    }

    setIsReady(true);

    return () => {
      if (shouldResetNavLayoutRef.current && initialLayout === 'horizontal') {
        // Only reset if it was horizontal originally
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
      sx={[
        (theme) => ({
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: theme.vars.palette.grey[50],
          color: theme.vars.palette.text.primary,
          [`& .${layoutClasses.sidebarContainer}`]: {
            minHeight: '100vh',
            backgroundColor: theme.vars.palette.grey[50],
          },
          [`& .${layoutClasses.main}`]: {
            minHeight: '100vh',
            backgroundColor: theme.vars.palette.grey[50],
          },
          [`& .${layoutClasses.content}`]: {
            backgroundColor: theme.vars.palette.grey[50],
            minHeight: '100%',
          },
        }),
      ]}
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
                  data={miniErpNavData}
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
            rightArea: <MiniErpDashboardHeaderActions />,
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
          data: miniErpNavData,
          slots: {
            bottomArea: <NavUserInfo />,
          },
        },
      }}
    >
      {children}
    </DashboardLayout>
  );
}

