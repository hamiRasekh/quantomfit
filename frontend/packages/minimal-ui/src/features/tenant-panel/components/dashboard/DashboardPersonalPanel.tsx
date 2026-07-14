'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import {
  TENANT_LIGHT,
  TENANT_SHELL,
  tenantGlassSurfaceSx,
} from '@/shared/theme/tenant-shell-theme';
import { useDashboardPersonalization } from '../../hooks/use-dashboard-personalization';
import { buildTenantHref } from '../../tenant-nav';
import { usePermissions } from '@/features/rbac/hooks/usePermissions';
import { DashboardPageRef, flattenTenantNavPages } from '../../utils/dashboard-personalization';
import { DashboardSectionTitle } from './DashboardSectionTitle';

type Props = {
  base: string;
  accent: string;
  isDark: boolean;
};

function panelCardSx(isDark: boolean, accent: string) {
  return {
    p: 2,
    height: '100%',
    ...tenantGlassSurfaceSx(isDark, { accentColor: accent, borderRadius: 3 }),
  };
}

function PageRow({
  page,
  href,
  accent,
  isDark,
  meta,
  trailing,
}: {
  page: { label: string; icon: string; sectionLabel?: string };
  href: string;
  accent: string;
  isDark: boolean;
  meta?: string;
  trailing?: React.ReactNode;
}) {
  const text = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;
  const muted = isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.2}
      sx={{
        p: 1.2,
        borderRadius: 2,
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: isDark ? alpha('#fff', 0.04) : alpha(accent, 0.05) },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          bgcolor: isDark ? alpha(accent, 0.14) : alpha(accent, 0.1),
          color: accent,
        }}
      >
        <Iconify icon={page.icon} width={20} />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component={Link}
          href={href}
          sx={{
            fontWeight: 700,
            fontSize: 13.5,
            color: text,
            textDecoration: 'none',
            '&:hover': { color: accent },
          }}
        >
          {page.label}
        </Typography>
        {page.sectionLabel || meta ? (
          <Typography sx={{ fontSize: 11.5, color: muted }}>{meta || page.sectionLabel}</Typography>
        ) : null}
      </Stack>
      {trailing}
    </Stack>
  );
}

function formatVisitTime(ts: number) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'همین الان';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  return `${days} روز پیش`;
}

export function DashboardPersonalPanel({ base, accent, isDark }: Props) {
  const { pins, history, addPin, removePin, isPinned } = useDashboardPersonalization(base);
  const { canViewPath } = usePermissions();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allPages = useMemo(
    () => flattenTenantNavPages().filter((page) => canViewPath(page.hrefSuffix)),
    [canViewPath],
  );
  const filteredPages = useMemo(() => {
    const q = search.trim();
    if (!q) return allPages;
    return allPages.filter(
      (p) =>
        p.label.includes(q) ||
        p.sectionLabel?.includes(q) ||
        p.hrefSuffix.includes(q)
    );
  }, [allPages, search]);

  const text = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card data-nav-card sx={panelCardSx(isDark, accent)}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <DashboardSectionTitle
                title="صفحات نشان‌شده"
                subtitle="دسترسی سریع به صفحات پرکاربرد شما"
                isDark={isDark}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:bookmark-bold-duotone" width={16} />}
                onClick={() => setPickerOpen(true)}
                sx={{
                  borderRadius: 999,
                  fontWeight: 700,
                  borderColor: alpha(accent, 0.35),
                  color: accent,
                }}
              >
                افزودن
              </Button>
            </Stack>

            {pins.length === 0 ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 3, opacity: 0.8 }}>
                <Iconify icon="solar:bookmark-linear" width={36} sx={{ color: accent }} />
                <Typography sx={{ fontSize: 13, color: text, textAlign: 'center' }}>
                  صفحه‌ای نشان نکرده‌اید. با «افزودن» صفحات پراستفاده را اینجا بگذارید.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={0.5}>
                {pins.map((page) => (
                  <PageRow
                    key={page.id}
                    page={page}
                    href={buildTenantHref(base, page.hrefSuffix)}
                    accent={accent}
                    isDark={isDark}
                    trailing={
                      <IconButton
                        size="small"
                        onClick={() => removePin(page.id)}
                        sx={{ color: isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted }}
                      >
                        <Iconify icon="solar:bookmark-bold" width={18} />
                      </IconButton>
                    }
                  />
                ))}
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card data-nav-card sx={panelCardSx(isDark, accent)}>
            <Box sx={{ mb: 1.5 }}>
              <DashboardSectionTitle
                title="تاریخچه بازدید"
                subtitle="آخرین صفحاتی که در پنل دیده‌اید"
                isDark={isDark}
              />
            </Box>

            {history.length === 0 ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 3, opacity: 0.8 }}>
                <Iconify icon="solar:history-linear" width={36} sx={{ color: accent }} />
                <Typography sx={{ fontSize: 13, color: text, textAlign: 'center' }}>
                  هنوز صفحه‌ای باز نکرده‌اید. با گشتن در پنل، تاریخچه اینجا پر می‌شود.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={0.5}>
                {history.slice(0, 8).map((visit) => (
                  <PageRow
                    key={`${visit.hrefSuffix}-${visit.visitedAt}`}
                    page={visit}
                    href={buildTenantHref(base, visit.hrefSuffix)}
                    accent={accent}
                    isDark={isDark}
                    meta={formatVisitTime(visit.visitedAt)}
                    trailing={
                      !isPinned(visit.hrefSuffix) ? (
                        <IconButton
                          size="small"
                          onClick={() => addPin(visit as DashboardPageRef)}
                          sx={{ color: isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted }}
                        >
                          <Iconify icon="solar:bookmark-linear" width={18} />
                        </IconButton>
                      ) : (
                        <Chip size="small" label="نشان" sx={{ height: 24, fontSize: 11, bgcolor: alpha(accent, 0.12), color: accent }} />
                      )
                    }
                  />
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>افزودن صفحه به نشان‌شده‌ها</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="جستجوی صفحه..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, mt: 0.5 }}
          />
          <Stack spacing={0.5} sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {filteredPages.map((page) => {
              const pinned = isPinned(page.id);
              return (
                <Stack
                  key={page.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(accent, 0.12)}`,
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                    <Iconify icon={page.icon} width={20} sx={{ color: accent, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{page.label}</Typography>
                      <Typography sx={{ fontSize: 11.5, opacity: 0.65 }}>{page.sectionLabel}</Typography>
                    </Box>
                  </Stack>
                  <Button
                    size="small"
                    disabled={pinned}
                    onClick={() => addPin(page)}
                    sx={{ fontWeight: 700, flexShrink: 0 }}
                  >
                    {pinned ? 'اضافه شده' : 'افزودن'}
                  </Button>
                </Stack>
              );
            })}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
