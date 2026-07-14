'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

import { FinancialHubConfig, getHubTab } from '../constants/hubs';

type Props = {
  hub: FinancialHubConfig;
  isDark: boolean;
  renderTab: (tabId: string) => ReactNode;
};

export function FinancialHubShell({ hub, isDark, renderTab }: Props) {
  const searchParams = useSearchParams();
  const basePath = useTenantBasePath();
  const { colors } = useTenantPageTheme();
  const tabId = searchParams.get('tab');
  const activeTab = getHubTab(hub.id, tabId);
  const text = isDark ? '#EAF2FF' : '#04044A';

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader title={hub.label} subtitle={hub.description} isDark={isDark} />

      <Stack
        direction="row"
        spacing={0.8}
        sx={{
          overflowX: 'auto',
          pb: 0.5,
          '&::-webkit-scrollbar': { height: 6 },
        }}
      >
        {hub.tabs.map((tab) => {
          const selected = tab.id === activeTab.id;
          const href = `${buildTenantHref(basePath, hub.path)}?tab=${tab.id}`;
          return (
            <Button
              key={tab.id}
              component={Link}
              href={href}
              size="small"
              variant={selected ? 'contained' : 'text'}
              startIcon={<Iconify icon={tab.icon} width={17} />}
              sx={{
                borderRadius: 999,
                flexShrink: 0,
                fontWeight: selected ? 800 : 650,
                px: 1.8,
                ...(selected
                  ? {
                      bgcolor: colors.primary,
                      color: '#fff',
                      boxShadow: `0 8px 20px ${colors.primary}45`,
                      '&:hover': { bgcolor: colors.primaryDark },
                    }
                  : { color: text }),
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Stack>

      <Box>{renderTab(activeTab.id)}</Box>
    </Stack>
  );
}
