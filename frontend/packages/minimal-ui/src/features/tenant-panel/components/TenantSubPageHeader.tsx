'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  isDark: boolean;
  action?: ReactNode;
};

export function TenantSubPageHeader({ title, subtitle, isDark, action }: Props) {
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.68)' : 'rgba(4,4,74,0.58)';

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
      <Stack spacing={0.4} sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 900, fontSize: 18, color: text }}>{title}</Typography>
        {subtitle ? (
          <Typography sx={{ fontSize: 13.5, color: muted, lineHeight: 1.55 }}>{subtitle}</Typography>
        ) : null}
      </Stack>
      {action ? <Stack sx={{ flexShrink: 0 }}>{action}</Stack> : null}
    </Stack>
  );
}
