import type { LinkProps } from '@mui/material/Link';
import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from '@/ui/routes/components';

import { BRAND_LOGO, BRAND_NAME } from '@/shared/config/brand';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  const singleLogo = (
    <img
      alt={BRAND_NAME}
      src={BRAND_LOGO}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  );

  const fullLogo = (
    <img
      alt={BRAND_NAME}
      src={BRAND_LOGO}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 44,
          height: 44,
          ...(!isSingle && { width: 120, height: 44 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
