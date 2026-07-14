'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';

const ORANGE = '#EA580C';

type DetailRowProps = {
  label: string;
  value: React.ReactNode;
};

export function OrderDetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{
        py: 1.35,
        borderBottom: '1px dashed',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ textAlign: 'left', minWidth: 0 }}>{value}</Box>
    </Stack>
  );
}

type CardProps = {
  title: string;
  icon: string;
  children: React.ReactNode;
};

export function OrderDetailInfoCard({ title, icon, children }: CardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 28px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{
          px: 2.5,
          py: 1.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${ORANGE}14`,
            color: ORANGE,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: 16 }}>{title}</Typography>
      </Stack>
      <Box sx={{ px: 2.5, py: 1.5 }}>{children}</Box>
    </Card>
  );
}

export function OrderDetailBadge({
  label,
  tone = 'orange',
}: {
  label: string;
  tone?: 'orange' | 'yellow' | 'green';
}) {
  const styles = {
    orange: { bgcolor: `${ORANGE}18`, color: ORANGE, borderColor: `${ORANGE}44` },
    yellow: { bgcolor: '#FACC1518', color: '#CA8A04', borderColor: '#FACC1555' },
    green: { bgcolor: '#16A34A18', color: '#16A34A', borderColor: '#16A34A44' },
  }[tone];

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        px: 1.25,
        py: 0.35,
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 800,
        border: '1px solid',
        ...styles,
      }}
    >
      {label}
    </Box>
  );
}
