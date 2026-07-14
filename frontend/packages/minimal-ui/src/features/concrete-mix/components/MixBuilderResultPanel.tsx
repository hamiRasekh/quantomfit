'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { toPersianNumber } from '@/lib/utils/persian-utils';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';

import { MIX_OUTPUT_FIELDS } from '../constants';
import { BuilderOrderContext, ConcreteMixCalculationResponse } from '../types';

type Props = {
  result: ConcreteMixCalculationResponse;
  orderContext?: BuilderOrderContext | null;
  isDark: boolean;
  accent: string;
  basePath: string;
  onRecalculate: () => void;
};

function formatKg(value: number): string {
  return toPersianNumber(value.toFixed(1));
}

export function MixBuilderResultPanel({
  result,
  orderContext,
  isDark,
  accent,
  basePath,
  onRecalculate,
}: Props) {
  const rows = useMemo(
    () =>
      MIX_OUTPUT_FIELDS.map((field) => ({
        ...field,
        perM3: Number(result.perM3[field.key] ?? 0),
        batch: Number(result.batch?.[field.key] ?? 0),
      })).filter((row) => row.perM3 > 0.001 || row.batch > 0.001),
    [result],
  );

  const monitoring = result.monitoring ?? {};
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.65)' : 'rgba(4,4,74,0.55)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)';
  const headerBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(4,4,74,0.03)';

  const orderLabel =
    orderContext?.orderNumber && orderContext.orderId === result.orderId
      ? `سفارش ${orderContext.orderNumber}`
      : 'طرح اختلاط';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: `1px solid ${border}`,
        bgcolor: isDark ? 'rgba(15,23,42,0.55)' : '#fff',
        animation: 'mixResultIn 0.45s ease',
        '@keyframes mixResultIn': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: `${accent}18`,
                  color: accent,
                }}
              >
                <Iconify icon="solar:document-text-bold-duotone" width={20} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 17, color: text }}>
                  نتیجه {orderLabel}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: muted, mt: 0.25 }}>
                  نسخه {result.formulaVersion.versionTag || '—'} · مخلوط {result.formulaVersion.baseMixCode}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Chip
            size="small"
            label="محاسبه شد"
            sx={{ bgcolor: `${accent}22`, color: accent, fontWeight: 800 }}
          />
        </Stack>

        {result.warnings?.length ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            {result.warnings.join(' — ')}
          </Alert>
        ) : null}

        <Box
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${border}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2, py: 1.25, bgcolor: headerBg, borderBottom: `1px solid ${border}` }}>
            <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: text }}>
              ترکیب مصالح
            </Typography>
          </Box>

          {rows.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                مقادیر خروجی برای نمایش در دسترس نیست.
              </Alert>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: muted }}>مصالح</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: muted }}>
                      هر m³ (kg)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: muted }}>
                      بچ (kg)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={row.key}
                      sx={{
                        bgcolor:
                          index % 2 === 0
                            ? 'transparent'
                            : isDark
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(4,4,74,0.02)',
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                          <Box
                            sx={{
                              width: 8,
                              height: 28,
                              borderRadius: 99,
                              bgcolor: row.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: text }}>
                            {row.label}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: accent }}>
                        {formatKg(row.perM3)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: text }}>
                        {row.batch > 0.001 ? formatKg(row.batch) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            size="small"
            variant="outlined"
            label={`W/C: ${Number(monitoring.waterCementRatio ?? 0).toFixed(3)}`}
            sx={{ borderColor: `${accent}44`, color: muted }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`SE: ${Number(monitoring.sandEquivalent ?? 0).toFixed(1)}`}
            sx={{ borderColor: `${accent}44`, color: muted }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`FM: ${Number(monitoring.sandFinenessModulus ?? 0).toFixed(2)}`}
            sx={{ borderColor: `${accent}44`, color: muted }}
          />
          {result.perM3.liveVolumeLitersNormalized != null ? (
            <Chip
              size="small"
              variant="outlined"
              label={`حجم: ${Number(result.perM3.liveVolumeLitersNormalized).toFixed(0)} L`}
              sx={{ borderColor: `${accent}44`, color: muted }}
            />
          ) : null}
        </Stack>

        {typeof monitoring.gradingAdvice === 'string' && monitoring.gradingAdvice ? (
          <Typography sx={{ fontSize: 12.5, color: muted, lineHeight: 1.7 }}>
            {monitoring.gradingAdvice}
          </Typography>
        ) : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            component={Link}
            href={buildTenantHref(basePath, `/concrete-mix/results/${result.formulaVersion.calculationRunId}`)}
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:eye-bold" />}
            sx={{ bgcolor: accent, fontWeight: 800 }}
          >
            جزئیات در بخش نتایج
          </Button>
          <Button variant="outlined" size="small" onClick={onRecalculate}>
            محاسبه مجدد
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
