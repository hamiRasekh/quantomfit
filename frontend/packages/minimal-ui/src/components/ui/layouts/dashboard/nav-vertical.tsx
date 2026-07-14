import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from '@/components/ui/nav-section';

import { useCallback, useEffect, useRef } from 'react';
import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { Logo } from '@/components/ui/logo';
import { Scrollbar } from '@/components/ui/scrollbar';
import { NavSectionMini, NavSectionVertical } from '@/components/ui/nav-section';

import { layoutClasses } from '../core';
import { NavUpgrade } from '../components/nav-upgrade';
import { NavToggleButton } from '../components/nav-toggle-button';

// ----------------------------------------------------------------------

export type NavVerticalProps = React.ComponentProps<'div'> &
  NavSectionProps & {
    isNavMini: boolean;
    layoutQuery?: Breakpoint;
    onToggleNav: () => void;
    slots?: {
      topArea?: React.ReactNode;
      bottomArea?: React.ReactNode;
    };
  };

export function NavVertical({
  sx,
  data,
  slots,
  cssVars,
  className,
  isNavMini,
  onToggleNav,
  checkPermissions,
  layoutQuery = 'md',
  ...other
}: NavVerticalProps) {
  useEffect(() => {
    if (isNavMini) return;
    let contentWrapper: HTMLElement | null = null;
    let wrapper: HTMLElement | null = null;
    let targetHeight = 0;
    let styleObserver: MutationObserver | null = null;
    let rafId: number | null = null;
    
    const fixHeight = () => {
      if (!wrapper || !contentWrapper) return;
      const currentWrapperHeight = wrapper.offsetHeight;
      if (currentWrapperHeight > 0 && currentWrapperHeight !== targetHeight) {
        targetHeight = currentWrapperHeight;
      }
      if (targetHeight > 0 && contentWrapper.offsetHeight !== targetHeight) {
        contentWrapper.style.setProperty('height', `${targetHeight}px`, 'important');
        contentWrapper.style.setProperty('max-height', `${targetHeight}px`, 'important');
      }
    };
    
    const initFix = () => {
      const navRoot = document.querySelector('.minimal__layout__nav__root') as HTMLElement;
      if (!navRoot) return;
      const scrollbarRoot = navRoot.querySelector('.minimal__scrollbar__root') as HTMLElement;
      if (!scrollbarRoot) return;
      wrapper = scrollbarRoot.querySelector('.simplebar-wrapper') as HTMLElement;
      contentWrapper = scrollbarRoot.querySelector('.simplebar-content-wrapper') as HTMLElement;
      
      if (wrapper && contentWrapper) {
        targetHeight = wrapper.offsetHeight;
        fixHeight();
        
        styleObserver = new MutationObserver(() => {
          if (rafId) return;
          rafId = requestAnimationFrame(() => {
            rafId = null;
            if (contentWrapper && targetHeight > 0) {
              const currentHeight = contentWrapper.offsetHeight;
              if (currentHeight !== targetHeight) {
                fixHeight();
              }
            }
          });
        });
        
        styleObserver.observe(contentWrapper, { attributes: true, attributeFilter: ['style'] });
      }
    };
    
    const timeoutId = setTimeout(initFix, 100);
    // Increased interval from 200ms to 1000ms for better performance
    const intervalId = setInterval(() => {
      if (wrapper && contentWrapper) {
        const newWrapperHeight = wrapper.offsetHeight;
        if (newWrapperHeight > 0 && newWrapperHeight !== targetHeight) {
          targetHeight = newWrapperHeight;
          fixHeight();
        }
      } else {
        initFix();
      }
    }, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (styleObserver) {
        styleObserver.disconnect();
      }
    };
  }, [isNavMini]);
  
  const renderNavVertical = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1, flexShrink: 0 }}>
          <Logo />
        </Box>
      )}

      <Scrollbar
        fillContent
        autoHide={false}
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          height: '100%',
          overflow: 'hidden',
          '& .simplebar-wrapper': {
            height: '100% !important',
            flex: '1 1 auto',
            minHeight: 0,
            maxHeight: '100%',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
          '& .simplebar-content-wrapper': {
            flex: '1 1 auto',
            minHeight: 0,
            maxHeight: '100% !important',
            height: 'auto !important',
            overflowY: 'auto !important',
            overflowX: 'hidden !important',
            position: 'relative',
            boxSizing: 'border-box',
          },
          '& .simplebar-content': {
            height: 'auto',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
          '& .simplebar-scrollbar': {
            right: 0,
            width: '8px',
          },
        }}
      >
        <NavSectionVertical
          data={data}
          cssVars={cssVars}
          checkPermissions={checkPermissions}
          sx={{ px: 2 }}
        />

        {slots?.bottomArea && (
          <Box sx={{ flexShrink: 0 }}>
            {slots.bottomArea}
          </Box>
        )}
        {!slots?.bottomArea && <NavUpgrade />}
      </Scrollbar>
    </>
  );

  const renderNavMini = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
          <Logo />
        </Box>
      )}

      <NavSectionMini
        data={data}
        cssVars={cssVars}
        checkPermissions={checkPermissions}
        sx={[
          (theme) => ({
            ...theme.mixins.hideScrollY,
            pb: 2,
            px: 0.5,
            flex: '1 1 auto',
            overflowY: 'auto',
          }),
        ]}
      />

      {slots?.bottomArea}
    </>
  );

  const handleToggleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleNav();
  }, [onToggleNav]);

  return (
    <NavRoot
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className])}
      sx={sx}
      onClick={(e) => {
        // Prevent clicks on NavRoot from propagating
        e.stopPropagation();
      }}
      {...other}
    >
      <NavToggleButton
        isNavMini={isNavMini}
        onClick={handleToggleClick}
        sx={[
          (theme) => ({
            display: 'none',
            [theme.breakpoints.up(layoutQuery)]: { 
              display: 'inline-flex',
              visibility: 'visible',
              opacity: 1,
            },
          }),
        ]}
      />
      {isNavMini ? renderNavMini() : renderNavVertical()}
    </NavRoot>
  );
}

// ----------------------------------------------------------------------

const NavRoot = styled('div', {
  shouldForwardProp: (prop: string) => !['isNavMini', 'layoutQuery', 'sx'].includes(prop),
})<Pick<NavVerticalProps, 'isNavMini' | 'layoutQuery'>>(
  ({ isNavMini, layoutQuery = 'md', theme }) => ({
    top: 0,
    left: 0,
    bottom: 0,
    height: '100vh',
    display: 'none',
    position: 'fixed',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 'var(--layout-nav-zIndex)',
    backgroundColor: 'var(--layout-nav-bg)',
    width: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
    borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
    transition: theme.transitions.create(['width'], {
      easing: 'var(--layout-transition-easing)',
      duration: 'var(--layout-transition-duration)',
    }),
    [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
  })
);
