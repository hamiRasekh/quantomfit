'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { useTenantPageTheme } from '../context/tenant-theme-context';
import { usePermissions } from '@/features/rbac/hooks/usePermissions';
import { buildTenantHref, getSectionNavPages, TenantNavSection } from '../tenant-nav';

type Props = {
  base: string;
  section: TenantNavSection;
  isDark: boolean;
};

export function TenantSectionBar({ base, section, isDark }: Props) {
  const pathname = usePathname();
  const { colors } = useTenantPageTheme();
  const { canViewPath } = usePermissions();
  const pages = getSectionNavPages(section).filter((page) => canViewPath(page.hrefSuffix));

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2.5 },
        py: 1.5,
        bgcolor: colors.sectionBarBg,
        borderBottom: `1px solid ${colors.sectionBarBorder}`,
        backdropFilter: isDark ? 'blur(16px)' : 'blur(8px)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ mb: 1.2 }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: isDark ? `${colors.primary}30` : `${colors.primary}18`,
              color: colors.primary,
            }}
          >
            <Iconify icon={section.icon} width={22} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 16, color: colors.appBarText }}>{section.label}</Typography>
            <Typography sx={{ fontSize: 12.5, color: isDark ? 'rgba(234,242,255,0.68)' : 'rgba(4,4,74,0.58)' }}>
              مدیریت زیربخش‌های {section.label}
            </Typography>
          </Box>
        </Stack>

        <Button
          component={Link}
          href={buildTenantHref(base, section.hrefSuffix)}
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="solar:chart-2-bold-duotone" width={18} />}
          sx={{
            borderRadius: 999,
            color: colors.appBarText,
            borderColor: isDark ? 'rgba(234,242,255,0.28)' : 'rgba(4,4,74,0.22)',
            whiteSpace: 'nowrap',
          }}
        >
          منو بخش
        </Button>
      </Stack>

      <Stack
        direction="row"
        spacing={0.8}
        sx={{
          overflowX: 'auto',
          pb: 0.3,
          '&::-webkit-scrollbar': { height: 6 },
        }}
      >
        {pages.map((page) => {
          const href = buildTenantHref(base, page.hrefSuffix);
          const selected =
            pathname === href ||
            (page.hrefSuffix !== section.hrefSuffix && pathname.startsWith(`${href}/`)) ||
            (page.hrefSuffix === section.hrefSuffix && pathname === href);

          return (
            <Button
              key={page.hrefSuffix}
              component={Link}
              href={href}
              size="small"
              variant={selected ? 'contained' : 'text'}
              startIcon={<Iconify icon={page.icon} width={17} />}
              sx={{
                borderRadius: 999,
                flexShrink: 0,
                fontWeight: selected ? 800 : 650,
                px: 1.8,
                ...(selected
                  ? {
                      bgcolor: colors.sectionBtn,
                      color: '#fff',
                      boxShadow: `0 8px 20px ${colors.primary}45`,
                      '&:hover': { bgcolor: colors.primaryDark },
                    }
                  : {
                      color: colors.appBarText,
                      '&:hover': { bgcolor: isDark ? 'rgba(234,242,255,0.08)' : 'rgba(4,4,74,0.05)' },
                    }),
              }}
            >
              {page.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
