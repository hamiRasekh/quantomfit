'use client';

import type { NavGroupProps, NavSectionProps } from '../types';

import { useRef, useState, useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { NavList } from './nav-list';
import { Scrollbar } from '../../scrollbar';
import { Nav, NavUl, NavLi } from '../components';
import { navSectionClasses, navSectionCssVars } from '../styles';

// ----------------------------------------------------------------------

export function NavSectionHorizontal({
  sx,
  data,
  render,
  className,
  slotProps,
  checkPermissions,
  enabledRootRedirect,
  cssVars: overridesVars,
  ...other
}: NavSectionProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  const cssVars = { ...navSectionCssVars.horizontal(theme), ...overridesVars };

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setNeedsScroll(contentWidth > containerWidth);
      }
    };

    checkOverflow();
    
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [data]);

  const navContent = (
    <Nav
      ref={contentRef}
      className={mergeClasses([navSectionClasses.horizontal, className])}
      sx={[
        () => ({
          ...cssVars,
          height: 1,
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          minHeight: 'var(--nav-height)',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <NavUl sx={{ flexDirection: 'row', gap: 'var(--nav-item-gap)' }}>
        {data.map((group) => (
          <Group
            key={group.subheader ?? group.items[0].title}
            render={render}
            cssVars={cssVars}
            items={group.items}
            slotProps={slotProps}
            checkPermissions={checkPermissions}
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </Nav>
  );

  return (
    <Box
      ref={containerRef}
      sx={{ height: 1, width: 1, overflow: 'hidden' }}
    >
      {needsScroll ? (
        <Scrollbar
          sx={{ height: 1 }}
          slotProps={{ contentSx: { height: 1, display: 'flex', alignItems: 'center' } }}
        >
          {navContent}
        </Scrollbar>
      ) : (
        <Box sx={{ height: 1, display: 'flex', alignItems: 'center' }}>
          {navContent}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

function Group({
  items,
  render,
  cssVars,
  slotProps,
  checkPermissions,
  enabledRootRedirect,
}: NavGroupProps) {
  return (
    <NavLi>
      <NavUl sx={{ flexDirection: 'row', gap: 'var(--nav-item-gap)' }}>
        {items.map((list) => (
          <NavList
            key={list.title}
            depth={1}
            data={list}
            render={render}
            cssVars={cssVars}
            slotProps={slotProps}
            checkPermissions={checkPermissions}
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </NavLi>
  );
}
