'use client';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Dayjs } from 'dayjs';

import { formatWeekRange, getWeekStart } from '../utils/week';

type Props = {
  weekStart: Dayjs;
  onChange: (next: Dayjs) => void;
  text: string;
  muted: string;
};

export function HrWeekNavigator({ weekStart, onChange, text, muted }: Props) {
  const goPrev = () => onChange(weekStart.subtract(7, 'day'));
  const goNext = () => onChange(weekStart.add(7, 'day'));
  const goToday = () => onChange(getWeekStart());

  const isCurrentWeek = getWeekStart().isSame(weekStart, 'day');

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={1}
    >
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton size="small" onClick={goPrev} aria-label="هفته قبل" sx={{ color: text }}>
          <ChevronRightIcon />
        </IconButton>
        <IconButton size="small" onClick={goNext} aria-label="هفته بعد" sx={{ color: text }}>
          <ChevronLeftIcon />
        </IconButton>
        <Button
          size="small"
          variant={isCurrentWeek ? 'contained' : 'outlined'}
          startIcon={<TodayIcon />}
          onClick={goToday}
          sx={{ ml: 0.5 }}
        >
          این هفته
        </Button>
      </Stack>
      <Typography sx={{ fontWeight: 800, color: text, textAlign: { xs: 'center', sm: 'left' } }}>
        {formatWeekRange(weekStart)}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: muted, textAlign: { xs: 'center', sm: 'right' } }}>
        هفته کاری (شنبه تا جمعه)
      </Typography>
    </Stack>
  );
}
