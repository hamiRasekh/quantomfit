/**
 * Task Manager Dashboard Layout
 * Custom layout for task management with task-specific navigation
 */

'use client';

import type { ReactNode } from 'react';
import type { Breakpoint } from '@mui/material/styles';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useBoolean } from 'minimal-shared/hooks';

import { useSettingsContext } from '@/components/ui/settings';

import type { NavItemProps } from '@/components/ui/nav-section';

import { DashboardLayout } from './layout';
import { useTaskManagerNavData } from './nav-config-task-manager';
import { TaskManagerDashboardHeaderActions } from './task-manager-dashboard-header-actions';
import { MenuButton } from '../components/menu-button';
import { NavMobile } from './nav-mobile';
import { Logo } from '@/components/ui/logo';
import { VerticalDivider } from './content';
import { dashboardNavColorVars } from './css-vars';
import { useTaskAuthStore } from '@/features/task-management-auth';

interface TaskManagerDashboardLayoutProps {
  children: ReactNode;
}

export default function TaskManagerDashboardLayout({
  children,
}: TaskManagerDashboardLayoutProps) {
  const theme = useTheme();
  const { state, setField } = useSettingsContext();
  const { user } = useTaskAuthStore();
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

  const isNavHorizontal = false; // Task manager layout always uses vertical navigation
  const taskManagerNavData = useTaskManagerNavData();

  const { roles } = useTaskAuthStore();

  const canDisplayItemByRole = useCallback(
    (allowedRoles?: NavItemProps['allowedRoles']) => {
      if (!allowedRoles) {
        return true;
      }

      // Ensure roles is always an array
      const rolesArray = Array.isArray(roles) ? roles : [];

      // For task manager, we use roles from task auth store
      const userRoles = rolesArray;

      if (typeof allowedRoles === 'string') {
        return !userRoles.includes(allowedRoles);
      }

      return !allowedRoles.some((role) => userRoles.includes(role));
    },
    [roles]
  );

  useEffect(() => {
    if (hasMountedRef.current) {
      return;
    }

    hasMountedRef.current = true;

    const initialLayout = initialNavLayoutRef.current;
    const needsOverride = initialLayout !== 'vertical';
    shouldResetNavLayoutRef.current = needsOverride;

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
      navLayout="vertical"
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
                  data={taskManagerNavData}
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
            rightArea: <TaskManagerDashboardHeaderActions />,
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
          data: taskManagerNavData,
        },
      }}
    >
      {children}
    </DashboardLayout>
  );
}

