'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { toPersianNumber } from '@/lib/utils/persian-utils';

import { WeatherResponse, displayTemperature } from '../types';
import { weatherMeta } from '../utils/weatherMeta';

type Props = {
  weather: WeatherResponse | null;
  loading?: boolean;
  locationAddress?: string | null;
  isDark: boolean;
  accent: string;
};

function formatTemp(value: number): string {
  return `${toPersianNumber(Math.round(value))}°`;
}

function formatPercent(value: number): string {
  return `${toPersianNumber(Math.round(value))}٪`;
}

function MetricCard({
  icon,
  label,
  value,
  isDark,
}: {
  icon: string;
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
        minHeight: 72,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)',
          color: '#3B82F6',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={20} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 11.5, color: isDark ? 'rgba(234,242,255,0.6)' : 'rgba(4,4,74,0.55)' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 800, color: isDark ? '#EAF2FF' : '#04044A' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export function WeatherWidget({ weather, loading, locationAddress, isDark, accent }: Props) {
  const cardBg = isDark ? 'rgba(15,23,42,0.55)' : 'rgba(248,250,252,0.95)';
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.65)' : 'rgba(4,4,74,0.55)';

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: cardBg,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
          display: 'grid',
          placeItems: 'center',
          minHeight: 220,
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress size={28} sx={{ color: accent }} />
          <Typography sx={{ fontSize: 13, color: muted }}>در حال دریافت آب‌وهوا...</Typography>
        </Stack>
      </Box>
    );
  }

  if (!weather) {
    return null;
  }

  const meta = weatherMeta(weather.weather_code);
  const displayTemp = displayTemperature(weather);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        bgcolor: cardBg,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Typography sx={{ fontSize: { xs: 28, sm: 34 }, fontWeight: 900, color: text, lineHeight: 1.1 }}>
            {formatTemp(displayTemp)}
            <Typography component="span" sx={{ fontSize: 16, fontWeight: 700, color: muted, mr: 0.5 }}>
              سانتی‌گراد
            </Typography>
          </Typography>
          <Typography sx={{ mt: 0.75, fontSize: 14, fontWeight: 700, color: muted }}>
            {meta.text}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 30,
            boxShadow: isDark ? 'none' : '0 8px 24px rgba(4,4,74,0.06)',
          }}
        >
          {meta.icon}
        </Box>
      </Stack>

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.25,
        }}
      >
        <MetricCard
          icon="solar:waterdrops-bold-duotone"
          label="احتمال بارش"
          value={formatPercent(weather.precipitation_probability)}
          isDark={isDark}
        />
        <MetricCard
          icon="solar:wind-bold-duotone"
          label="رطوبت هوا"
          value={formatPercent(weather.humidity_mean)}
          isDark={isDark}
        />
        <MetricCard
          icon="solar:thermometer-bold-duotone"
          label="دمای حداقل"
          value={formatTemp(weather.temperature_min)}
          isDark={isDark}
        />
        <MetricCard
          icon="solar:thermometer-bold-duotone"
          label="دمای حداکثر"
          value={formatTemp(weather.temperature_max)}
          isDark={isDark}
        />
      </Box>

      {locationAddress ? (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, pt: 1.5 }}>
          <Iconify icon="solar:map-point-bold-duotone" width={18} sx={{ color: '#3B82F6' }} />
          <Typography sx={{ fontSize: 12.5, color: muted }}>{locationAddress}</Typography>
        </Stack>
      ) : null}

      {weather.cached ? (
        <Typography sx={{ mt: 1, fontSize: 11, color: muted }}>داده از حافظه موقت (۳۰ دقیقه)</Typography>
      ) : null}
    </Box>
  );
}
