'use client';

import type { Breakpoint } from '@mui/material/styles';
import type { NavItemProps, NavSectionProps } from '@/components/ui/nav-section';
import type { MainSectionProps, HeaderSectionProps, LayoutSectionProps } from '../core';

import { merge } from 'es-toolkit';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { iconButtonClasses } from '@mui/material/IconButton';

import { useRealUser } from '@/lib/hooks/use-real-user';

import { allLangs } from '@/ui/locales';
import { Logo } from '@/components/ui/logo';
import { useSettingsContext } from '@/components/ui/settings';
import { usePathname } from '@/ui/routes/hooks';

import { NavMobile } from './nav-mobile';
import { VerticalDivider } from './content';
import { NavVertical } from './nav-vertical';
import { NavHorizontal } from './nav-horizontal';
import { MainAppFooter } from './footer';
import type { FooterSettings } from '@/features/admin-footer-settings/types/footer-settings.types';
import { useNavData } from '../nav-config-main-app';
import { CartBadge } from '../components/cart-badge';
import { MenuButton } from '../components/menu-button';
import { useAccountNavData } from '../nav-config-account';
import { SignInButton } from '../components/sign-in-button';
import { AccountDrawer } from '../components/account-drawer';
import { LanguagePopover } from '../components/language-popover';
import { ChatSupportButton } from '../components/chat-support-button';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { MainSection, layoutClasses, HeaderSection, LayoutSection } from '../core';
import { useAuthContext, useCartCountContext } from '../../contexts/cart-count-context';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type MainAppLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  footerSettings?: FooterSettings | null;
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavSectionProps['data'];
    };
    main?: MainSectionProps;
  };
};

export function MainAppLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
  footerSettings,
}: MainAppLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const settings = useSettingsContext();
  const pathname = usePathname();

  // Get cart and user data from context (provided by app)
  const cartItemCount = useCartCountContext();
  const isAuthenticated = useAuthContext();

  // Check if we're on canvas page
  const isCanvasPage = pathname?.startsWith('/canvas') ?? false;

  // ✅ Get real user from auth store + cart context
  const { user: realUser } = useRealUser();

  // ❌ NEVER use mock user - only show real user if authenticated
  const user = isAuthenticated ? realUser : null;

  // 🔧 Fix hydration mismatch - wait for client mount
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Disable scroll on canvas page
  useEffect(() => {
    if (!isMounted) return; // Wait for client mount

    if (isCanvasPage) {
      // Store original styles to restore later
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyWidth = document.body.style.width;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      // Disable scroll on body and html
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        // Re-enable scroll when leaving canvas page
        // Restore original styles or reset to default
        document.body.style.overflow = originalBodyOverflow || '';
        document.body.style.position = originalBodyPosition || '';
        document.body.style.width = originalBodyWidth || '';
        document.documentElement.style.overflow = originalHtmlOverflow || '';

        // Force scroll restoration on mobile - ensure it's reset
        if (typeof window !== 'undefined') {
          // Use requestAnimationFrame for better timing
          requestAnimationFrame(() => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.documentElement.style.overflow = '';

            // Additional check for mobile
            if (isMobile || window.innerWidth < 960) {
              // Force remove any remaining fixed positioning
              document.body.style.removeProperty('overflow');
              document.body.style.removeProperty('position');
              document.body.style.removeProperty('width');
              document.documentElement.style.removeProperty('overflow');

              // Extra check for mobile - ensure scroll is enabled
              setTimeout(() => {
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('position');
                document.body.style.removeProperty('width');
                document.documentElement.style.removeProperty('overflow');
              }, 100);
            }
          });
        }
      };
    } else {
      // Ensure scroll is enabled when NOT on canvas page
      // This handles cases where user navigates directly to home page or refreshes
      if (typeof window !== 'undefined') {
        // Remove any canvas-related styles immediately
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('width');
        document.documentElement.style.removeProperty('overflow');

        // Double-check after a small delay (for mobile)
        requestAnimationFrame(() => {
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('position');
          document.body.style.removeProperty('width');
          document.documentElement.style.removeProperty('overflow');

          // Extra check for mobile
          if (isMobile) {
            setTimeout(() => {
              document.body.style.removeProperty('overflow');
              document.body.style.removeProperty('position');
              document.body.style.removeProperty('width');
              document.documentElement.style.removeProperty('overflow');
            }, 50);
          }
        });
      }
    }
  }, [isCanvasPage, isMounted, isMobile]);

  // Additional effect to ensure scroll is enabled on non-canvas pages (especially for mobile)
  useEffect(() => {
    if (!isMounted) return;

    // Only run when NOT on canvas page
    if (!isCanvasPage && typeof window !== 'undefined') {
      // Ensure scroll is enabled
      const enableScroll = () => {
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('width');
        document.documentElement.style.removeProperty('overflow');
      };

      // Run immediately
      enableScroll();

      // Run after a delay for mobile
      if (isMobile) {
        setTimeout(enableScroll, 50);
        setTimeout(enableScroll, 200);
      }
    }
  }, [isCanvasPage, isMounted, isMobile]);

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const mainAppNavData = useNavData();
  const accountNavData = useAccountNavData();
  const navData = slotProps?.nav?.data ?? mainAppNavData;

  const isNavMini = settings.state.navLayout === 'mini';
  // Always show horizontal nav in desktop (main app layout)
  const isNavHorizontal = true;
  const isNavVertical = false;

  const canDisplayItemByRole = (allowedRoles: NavItemProps['allowedRoles']): boolean => {
    // If no user or no role checking needed, allow display
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user) return true;
    // Check if user has role property and if it's in allowed roles
    const userRole = (user as any)?.role;
    return !userRole || !allowedRoles.includes(userRole);
  };

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical ? { px: { [layoutQuery]: 5 } } : {}),
          ...(isNavHorizontal ? {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          } : {}),
        },
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      bottomArea: null,
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            cssVars={navVars.section}
            checkPermissions={canDisplayItemByRole}
          />

          {/** @slot Logo */}
          {isNavHorizontal && (
            <Logo
              sx={{
                display: 'none',
                [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
              }}
            />
          )}

          {/** @slot Divider */}
          {isNavHorizontal && (
            <VerticalDivider sx={{ [theme.breakpoints.up(layoutQuery)]: { display: 'flex' } }} />
          )}

          {/** @slot Nav horizontal */}
          {isNavHorizontal && (
            <NavHorizontal
              data={navData}
              layoutQuery={layoutQuery}
              cssVars={navVars.section}
              checkPermissions={canDisplayItemByRole}
              sx={{ flex: 1, ml: 2 }}
            />
          )}
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Searchbar */}
          {/* <Searchbar data={navData} /> */}

          {/** @slot Language popover */}
          <LanguagePopover data={allLangs} />

          {/** @slot Cart badge - only show if authenticated */}
          {isMounted && isAuthenticated && <CartBadge itemCount={cartItemCount} />}

          {/** @slot Notifications popover */}
          {/* <NotificationsDrawer data={_notifications} /> */}

          {/** @slot Contacts popover */}
          {/* <ContactsPopover data={_contacts} /> */}

          {/** @slot Settings button */}
          {/* <SettingsButton /> */}

          {/** @slot Account drawer or Sign in button */}
          {isMounted && isAuthenticated && user ? (
            <AccountDrawer
              data={accountNavData}
              user={realUser as any}
              sx={{ ml: 1 }}
            />
          ) : (
            <SignInButton />
          )}
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      checkPermissions={canDisplayItemByRole}
      onToggleNav={() =>
        settings.setField(
          'navLayout',
          settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
        )
      }
    />
  );

  const renderFooter = () => {
    // Don't show footer on canvas page
    if (isCanvasPage) return null;
    // Use default settings if not provided (for client components)
    const defaultSettings: FooterSettings = {
      description: 'پلتفرم طراحی و سفارش آنلاین محصولات شخصی‌سازی شده',
      address: 'تهران، خیابان ولیعصر، پلاک 123',
      email: 'support@voody.app',
      instagram_url: 'https://www.instagram.com/voody.app',
      enamad_id: '517711',
      enamad_code: 'h2ktN1Yfmt1I0zmhVkEqtNNx31xia38m',
      samandehi_id: '394889',
      samandehi_code: 'xlaopfvlaodsmcsimcsipfvl',
      links: [],
    };
    return <MainAppFooter settings={footerSettings || defaultSettings} />;
  };

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={isNavHorizontal ? null : renderSidebar()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
          // Disable scroll on canvas page
          ...(isCanvasPage && {
            overflow: 'hidden',
            height: '100vh',
            [`& #root__layout`]: {
              overflow: 'hidden',
              height: '100vh',
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}

      {/* Support Chat Button */}
      <ChatSupportButton />
    </LayoutSection>
  );
}
