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

import { PersonnelFilters } from '../types';

type Props = {
  filters: PersonnelFilters;
  onFiltersChange: (filters: Partial<PersonnelFilters>) => void;
  onResetFilters: () => void;
  canReset: boolean;
  positionOptions: { label: string; value: string }[];
};

export function PersonnelTableToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  canReset,
  positionOptions,
}: Props) {
  const handleFilterSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ search: event.target.value });
    },
    [onFiltersChange],
  );

  const handleFilterStatus = useCallback(
    (value: 'all' | boolean) => {
      onFiltersChange({ isActive: value });
    },
    [onFiltersChange],
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
      }}
    >
      <Box
        sx={{
          gap: 2,
          width: 1,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <TextField
          fullWidth
          value={filters.search}
          onChange={handleFilterSearch}
          placeholder="جستجو..."
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

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>وضعیت</InputLabel>
          <Select
            value={
              filters.isActive === 'all'
                ? 'all'
                : filters.isActive
                  ? 'active'
                  : 'inactive'
            }
            label="وضعیت"
            onChange={(e) => {
              const value = e.target.value;
              handleFilterStatus(
                value === 'all' ? 'all' : value === 'active' ? true : false,
              );
            }}
          >
            <MenuItem value="all">همه</MenuItem>
            <MenuItem value="active">فعال</MenuItem>
            <MenuItem value="inactive">غیرفعال</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>سمت</InputLabel>
          <Select
            label="سمت"
            value={filters.positionId || 'all'}
            onChange={(event) =>
              onFiltersChange({
                positionId:
                  event.target.value === 'all'
                    ? ''
                    : (event.target.value as string),
              })
            }
          >
            <MenuItem value="all">همه سمت‌ها</MenuItem>
            {positionOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
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

