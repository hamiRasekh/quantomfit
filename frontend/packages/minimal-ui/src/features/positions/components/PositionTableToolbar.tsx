'use client';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { InputAdornment } from '@mui/material';
import { Iconify } from '@/components/ui/iconify';
import { PositionFilters } from '../types';

type Props = {
  filters: PositionFilters;
  onFiltersChange: (filters: Partial<PositionFilters>) => void;
  onResetFilters: () => void;
  canReset: boolean;
};

export function PositionTableToolbar({
  filters,
  onFiltersChange,
}: Props) {
  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        px: 2,
        py: 2,
      }}
    >
      <TextField
        value={filters.search}
        onChange={(event) => onFiltersChange({ search: event.target.value })}
        placeholder="جستجوی نام یا کد سمت..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="solar:magnifer-linear" width={20} />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: { xs: 1, sm: 240 } }}
      />

      <TextField
        select
        label="وضعیت"
        value={filters.isActive}
        onChange={(event) =>
          onFiltersChange({
            isActive: event.target.value as PositionFilters['isActive'],
          })
        }
        sx={{ width: { xs: '100%', sm: 180 } }}
      >
        <MenuItem value="all">همه</MenuItem>
        <MenuItem value="true">فقط فعال</MenuItem>
        <MenuItem value="false">غیرفعال</MenuItem>
      </TextField>
    </Box>
  );
}


