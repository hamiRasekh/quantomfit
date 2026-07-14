'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '@/components/ui/iconify';
import { AttributeFilters } from '../types';

type Props = {
  filters: AttributeFilters;
  onFiltersChange: (filters: AttributeFilters) => void;
  onResetFilters: () => void;
  canReset: boolean;
};

export function AttributeTableToolbar({ filters, onFiltersChange, onResetFilters, canReset }: Props) {
  const handleFilterSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, search: event.target.value });
    },
    [filters, onFiltersChange],
  );

  const handleFilterStatus = useCallback(
    (value: 'all' | boolean) => {
      onFiltersChange({ ...filters, isActive: value });
    },
    [filters, onFiltersChange],
  );

  return (
    <Box
      sx={{
        p: 2.5,
        gap: 2,
        display: 'flex',
        pr: { xs: 2.5, md: 1 },
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-end', md: 'center' },
        flexWrap: 'wrap',
      }}
    >
      <Box
        sx={{
          gap: 2,
          width: 1,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          fullWidth
          value={filters.search}
          onChange={handleFilterSearch}
          placeholder="جستجو بر اساس نام..."
          sx={{ minWidth: 200, flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>وضعیت</InputLabel>
          <Select
            value={filters.isActive === 'all' ? 'all' : filters.isActive ? 'active' : 'inactive'}
            label="وضعیت"
            onChange={(e) => {
              const value = e.target.value;
              handleFilterStatus(value === 'all' ? 'all' : value === 'active');
            }}
          >
            <MenuItem value="all">همه</MenuItem>
            <MenuItem value="active">فعال</MenuItem>
            <MenuItem value="inactive">غیرفعال</MenuItem>
          </Select>
        </FormControl>

        {canReset && (
          <IconButton onClick={onResetFilters}>
            <Iconify icon="solar:restart-bold" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

