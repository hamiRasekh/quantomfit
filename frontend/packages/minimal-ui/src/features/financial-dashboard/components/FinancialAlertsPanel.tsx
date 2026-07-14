'use client';

import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FinancialAlert } from '../types';

const SEV_COLOR: Record<FinancialAlert['severity'], 'error' | 'warning' | 'info' | 'default'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const SEV_LABEL: Record<FinancialAlert['severity'], string> = {
  critical: 'بحرانی',
  high: 'بالا',
  medium: 'متوسط',
  low: 'پایین',
};

type Props = {
  alerts: FinancialAlert[];
  isDark: boolean;
  title?: string;
};

export function FinancialAlertsPanel({ alerts, isDark, title = 'هشدارهای مالی' }: Props) {
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.7)' : 'rgba(4,4,74,0.6)';

  if (!alerts.length) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3 }}>
      <Typography sx={{ fontWeight: 900, fontSize: 15, mb: 1.5, color: text }}>{title}</Typography>
      <Stack spacing={1.2}>
        {alerts.map((alert) => (
          <Stack
            key={alert.id}
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,4,74,0.08)',
            }}
          >
            <Chip size="small" color={SEV_COLOR[alert.severity]} label={SEV_LABEL[alert.severity]} />
            <Stack spacing={0.3} sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: text }}>{alert.title}</Typography>
              <Typography sx={{ fontSize: 13, color: muted }}>{alert.description}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 11, color: muted, whiteSpace: 'nowrap' }}>{alert.createdAt}</Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
