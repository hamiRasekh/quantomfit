'use client';

import { useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { MIX_OUTPUT_FIELDS } from '../constants';
import { ConcreteMixPerM3Output } from '../types';

type Props = {
  perM3: ConcreteMixPerM3Output;
  batch?: Record<string, number>;
  monitoring?: Record<string, unknown>;
  isDark: boolean;
  accent: string;
  title?: string;
  subtitle?: string;
};

export function MixOutputVisualization({
  perM3,
  batch,
  monitoring,
  isDark,
  accent,
  title = 'خروجی طرح اختلاط (هر م³)',
  subtitle,
}: Props) {
  const rows = useMemo(() => {
    return MIX_OUTPUT_FIELDS.map((field) => {
      const value = Number(perM3[field.key] ?? 0);
      return { ...field, value };
    }).filter((row) => row.value > 0.001);
  }, [perM3]);

  const max = useMemo(() => Math.max(...rows.map((r) => r.value), 1), [rows]);
  const batchRows = useMemo(
    () =>
      MIX_OUTPUT_FIELDS.map((field) => ({
        ...field,
        value: Number(batch?.[field.key] ?? 0),
      })).filter((row) => row.value > 0.001),
    [batch],
  );

  const surface = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(4,4,74,0.04)';
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.7)' : 'rgba(4,4,74,0.65)';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
        background: isDark
          ? 'linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,41,59,0.55))'
          : 'linear-gradient(145deg, #ffffff, #f8fafc)',
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontWeight: 900, color: text, fontSize: 17 }}>{title}</Typography>
            {subtitle ? (
              <Typography sx={{ color: muted, fontSize: 13, mt: 0.5 }}>{subtitle}</Typography>
            ) : null}
          </Box>
          {batch?.cementKg ? (
            <Chip
              size="small"
              label={`بچ: ${Number(batch.cementKg).toFixed(1)} kg سیمان`}
              sx={{ bgcolor: `${accent}22`, color: accent, fontWeight: 700 }}
            />
          ) : null}
        </Stack>

        {rows.length === 0 ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            مقادیر خروجی برای نمایش در دسترس نیست. لطفاً جزئیات کامل اجرا را بررسی کنید.
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            {rows.map((row) => (
              <Stack key={row.key} spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: text }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: accent }}>
                    {row.value.toFixed(1)} kg
                  </Typography>
                </Stack>
                <Box sx={{ height: 10, borderRadius: 99, bgcolor: surface, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(row.value / max) * 100}%`,
                      borderRadius: 99,
                      background: `linear-gradient(90deg, ${row.color}88, ${row.color})`,
                      transition: 'width 0.6s ease-out',
                    }}
                  />
                </Box>
              </Stack>
            ))}
          </Box>
        )}

        {(perM3.liveVolumeLitersNormalized || perM3.normalizationFactor) && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {perM3.liveVolumeLitersNormalized != null && (
              <Chip
                label={`حجم نرمال‌شده: ${Number(perM3.liveVolumeLitersNormalized).toFixed(1)} L`}
                variant="outlined"
                sx={{ borderColor: `${accent}55`, color: muted }}
              />
            )}
            {perM3.normalizationFactor != null && (
              <Chip
                label={`ضریب نرمال‌سازی: ${Number(perM3.normalizationFactor).toFixed(4)}`}
                variant="outlined"
                sx={{ borderColor: `${accent}55`, color: muted }}
              />
            )}
          </Stack>
        )}

        {batchRows.length > 0 ? (
          <Box>
            <Typography sx={{ fontWeight: 800, color: text, mb: 1 }}>
              خروجی بچ میکسر
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {batchRows.map((row) => (
                <Chip
                  key={row.key}
                  label={`${row.label}: ${row.value.toFixed(1)} kg`}
                  sx={{ bgcolor: surface, color: text }}
                />
              ))}
            </Stack>
          </Box>
        ) : null}

        {monitoring ? (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={`W/C: ${Number(monitoring.waterCementRatio ?? 0).toFixed(3)}`} variant="outlined" />
              <Chip label={`FM: ${Number(monitoring.sandFinenessModulus ?? 0).toFixed(2)}`} variant="outlined" />
              <Chip label={`الک ۲۰۰: ${Number(monitoring.passing200Percent ?? 0).toFixed(1)}٪`} variant="outlined" />
            </Stack>
            {typeof monitoring.gradingAdvice === 'string' ? (
              <Typography sx={{ color: muted, fontSize: 13 }}>
                {monitoring.gradingAdvice}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
