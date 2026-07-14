'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { BuilderOrderContext } from '../types';

type Props = {
  order: BuilderOrderContext;
  isDark: boolean;
  accent: string;
};

export function MixBuilderOrderSummary({ order, isDark, accent }: Props) {
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.65)' : 'rgba(4,4,74,0.55)';

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${accent}44`,
        bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(37,99,235,0.06)',
      }}
    >
      <Stack spacing={1.5}>
        <Typography sx={{ fontWeight: 900, color: text }}>
          سفارش {order.orderNumber} — اطلاعات طرح (از سفارش)
        </Typography>
        <Grid container spacing={1.5}>
          {order.summaryFields.map((field) => (
            <Grid key={field.label} size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: 11.5, color: muted }}>{field.label}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: text }}>{field.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
