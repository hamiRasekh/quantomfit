'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import {
  CONCRETE_APPLICATION_OPTIONS,
  ConcreteApplicationOption,
  ConcreteApplicationType,
} from '../constants/concrete-application-types';

const PRIMARY_COUNT = 4;

type Props = {
  value?: ConcreteApplicationType | '';
  onChange: (value: ConcreteApplicationType) => void;
  error?: string;
};

function OptionCard({
  option,
  selected,
  accent,
  onSelect,
}: {
  option: ConcreteApplicationOption;
  selected: boolean;
  accent: string;
  onSelect: () => void;
}) {
  const theme = useTheme();

  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Box
        component="button"
        type="button"
        onClick={onSelect}
        sx={{
          width: '100%',
          p: 2,
          borderRadius: 2.5,
          border: '2px solid',
          borderColor: selected ? accent : alpha(theme.palette.divider, 0.9),
          bgcolor: selected ? alpha(accent, 0.06) : 'background.paper',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
          boxShadow: selected ? `0 0 0 1px ${alpha(accent, 0.2)}` : 'none',
          '&:hover': {
            borderColor: selected ? accent : alpha(accent, 0.45),
            bgcolor: selected ? alpha(accent, 0.08) : alpha(accent, 0.03),
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 1,
            display: 'grid',
            placeItems: 'center',
            color: selected ? accent : 'text.secondary',
          }}
        >
          <Iconify icon={option.icon} width={40} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary' }}>
          {option.label}
        </Typography>
      </Box>
    </Grid>
  );
}

export function ApplicationTypePicker({ value, onChange, error }: Props) {
  const theme = useTheme();
  const [showMore, setShowMore] = useState(() => {
    if (!value) return false;
    const index = CONCRETE_APPLICATION_OPTIONS.findIndex((o) => o.value === value);
    return index >= PRIMARY_COUNT;
  });

  const primaryOptions = CONCRETE_APPLICATION_OPTIONS.slice(0, PRIMARY_COUNT);
  const moreOptions = CONCRETE_APPLICATION_OPTIONS.slice(PRIMARY_COUNT);
  const accent = theme.palette.primary.main;

  const renderGrid = useMemo(
    () => (options: ConcreteApplicationOption[]) => (
      <Grid container spacing={1.5}>
        {options.map((option) => (
          <OptionCard
            key={option.value}
            option={option}
            selected={value === option.value}
            accent={accent}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </Grid>
    ),
    [accent, onChange, value],
  );

  return (
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: 17, mb: 0.5 }}>انتخاب نوع کاربرد</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
        لطفاً نوع کاربرد بتن را انتخاب کنید
      </Typography>

      {renderGrid(primaryOptions)}

      {moreOptions.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => setShowMore((prev) => !prev)}
              startIcon={
                <Iconify
                  icon={showMore ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                  width={18}
                />
              }
              sx={{ fontWeight: 700, borderRadius: 999 }}
            >
              {showMore ? 'مخفی کردن گزینه‌های بیشتر' : 'نمایش گزینه‌های بیشتر'}
            </Button>
          </Box>

          {showMore ? renderGrid(moreOptions) : null}
        </>
      )}

      {error ? (
        <Typography sx={{ fontSize: 12, color: 'error.main', mt: 1 }}>{error}</Typography>
      ) : null}
    </Box>
  );
}
