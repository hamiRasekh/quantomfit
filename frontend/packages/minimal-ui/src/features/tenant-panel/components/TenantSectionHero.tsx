'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { usePermissions } from '@/features/rbac/hooks/usePermissions';
import { TENANT_SHELL, tenantBrandAccentBarSx } from '@/shared/theme/tenant-shell-theme';
import { useTenantPageTheme } from '../context/tenant-theme-context';
import { getSectionHeroDescription, getSectionHeroImage } from '../tenant-section-hero';
import { buildTenantHref, getSectionNavPages, TenantNavSection } from '../tenant-nav';

type Props = {
  base: string;
  section: TenantNavSection;
  pageTitle: string;
  isDark: boolean;
};

export function TenantSectionHero({ base, section, pageTitle, isDark }: Props) {
  const pathname = usePathname();
  const theme = useTheme();
  const { colors, accent } = useTenantPageTheme();
  const { canViewPath } = usePermissions();
  const pages = getSectionNavPages(section).filter((page) => canViewPath(page.hrefSuffix));

  const heroImage = getSectionHeroImage(section.id);
  const description = getSectionHeroDescription(section.id, section.label);
  const isIndustrial = accent === 'industrial';
  /** hero همیشه روی تصویر تیره — مستقل از light/dark کل پنل */
  const heroTextColor = TENANT_SHELL.text;
  const heroMutedColor = alpha('#F8FAFC', 0.78);
  const heroTabMutedColor = alpha('#F8FAFC', 0.62);
  const accentSecondary = isIndustrial ? colors.secondary : colors.primaryLight;
  const isRtl = theme.direction === 'rtl';
  /** در RTL، stylis left/right را flip می‌کند — برای راست فیزیکی از left استفاده می‌کنیم */
  const physicalRight = isRtl ? 'left' : 'right';

  return (
    <Box
      data-section-hero
      sx={{
        position: 'relative',
        mb: 2.5,
        borderRadius: { xs: 2, md: 2.5 },
        overflow: 'hidden',
        border: `1px solid ${alpha('#fff', 0.08)}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 320, sm: 380, md: 420 },
        ...(isIndustrial ? tenantBrandAccentBarSx() : {}),
      }}
    >
      <Box
        component="img"
        src={heroImage}
        alt=""
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: isRtl ? '15% center' : '85% center',
          display: 'block',
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom,
                ${alpha(TENANT_SHELL.bgDeep, 0.12)} 0%,
                ${alpha(TENANT_SHELL.bgDeep, 0.28)} 55%,
                ${alpha(TENANT_SHELL.bgDeep, 0.72)} 100%)`,
          pointerEvents: 'none',
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [physicalRight]: 0,
          width: { xs: '100%', md: '58%' },
          background: `linear-gradient(to ${isRtl ? 'right' : 'left'},
              ${alpha(TENANT_SHELL.bgDeep, 0.72)} 0%,
              ${alpha(TENANT_SHELL.bgDeep, 0.32)} 45%,
              transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* متن — راست فیزیکی + راست‌چین */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, md: 3 },
        }}
      >
        <Stack
          spacing={1.25}
          sx={{
            width: { xs: '100%', md: 'auto' },
            maxWidth: { xs: '100%', md: 500 },
            // در RTL، mr:auto → چسبیدن به راست فیزیکی
            ml: 0,
            mr: 'auto',
            alignItems: 'flex-end',
            direction: 'ltr',
            textAlign: 'right',
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="flex-start"
            sx={{
              width: '100%',
              direction: 'ltr',
              justifyContent: 'flex-start',
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                mt: 0.15,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: accentSecondary,
              }}
            >
              <Iconify icon={section.icon} width={28} />
            </Box>
            <Box sx={{ minWidth: 0, direction: 'rtl', textAlign: 'right' }}>
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  color: heroMutedColor,
                  mb: 0.25,
                  textAlign: 'right',
                }}
              >
                {pageTitle !== section.label ? pageTitle : `مدیریت زیربخش‌های ${section.label}`}
              </Typography>
              <Typography
                component="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 19, md: 22 },
                  lineHeight: 1.25,
                  color: heroTextColor,
                  textAlign: 'left',
                }}
              >
                {section.label}
              </Typography>
            </Box>
          </Stack>

          <Typography
            sx={{
              fontSize: 12.5,
              lineHeight: 1.65,
              color: heroMutedColor,
              width: '100%',
              direction: 'rtl',
              textAlign: 'left',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {description}
          </Typography>
        </Stack>
      </Box>

      {/* نوار تب — پایین hero، تمام‌عرض، اسکرول افقی */}
      {pages.length > 0 && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            flexShrink: 0,
            width: '100%',
            borderTop: `1px solid ${alpha('#fff', 0.1)}`,
            bgcolor: alpha(TENANT_SHELL.bgDeep, 0.55),
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              direction: 'ltr',
              display: 'flex',
              justifyContent: 'flex-start',
              px: { xs: 1.75, md: 2.25 },
              py: { xs: 1, md: 1.15 },
              scrollbarWidth: 'thin',
              scrollbarColor: `${alpha(accentSecondary, 0.45)} transparent`,
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: 4,
                bgcolor: alpha(accentSecondary, 0.4),
              },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center',
                gap: { xs: 1.75, md: 2.25 },
                flexShrink: 0,
              }}
            >
            {pages.map((page) => {
              const href = buildTenantHref(base, page.hrefSuffix);
              const selected =
                pathname === href ||
                (page.hrefSuffix !== section.hrefSuffix && pathname.startsWith(`${href}/`));

              return (
                <Box
                  key={page.hrefSuffix}
                  component={Link}
                  href={href}
                  data-hero-tab
                  sx={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    direction: 'ltr',
                    alignItems: 'center',
                    gap: 0.5,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                    px: 0,
                    py: 0.2,
                    textDecoration: 'none',
                    border: 'none !important',
                    borderRadius: '0 !important',
                    bgcolor: 'transparent !important',
                    boxShadow: 'none !important',
                    fontWeight: selected ? 800 : 500,
                    fontSize: 13,
                    lineHeight: 1.3,
                    color: `${selected ? accentSecondary : heroTabMutedColor} !important`,
                    transition: 'color 0.15s ease',
                    borderBottom: selected
                      ? `2px solid ${accentSecondary}`
                      : '2px solid transparent',
                    pb: 0.35,
                    '&:hover': {
                      color: `${selected ? accentSecondary : heroTextColor} !important`,
                      bgcolor: 'transparent !important',
                    },
                  }}
                >
                  <Iconify icon={page.icon} width={15} sx={{ opacity: selected ? 1 : 0.75 }} />
                  {page.label}
                </Box>
              );
            })}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
