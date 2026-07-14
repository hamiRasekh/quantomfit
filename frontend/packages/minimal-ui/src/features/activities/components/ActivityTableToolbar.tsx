'use client';

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '@/components/ui/iconify';
import { processesApi } from '@/features/processes/api/processesApi';
import { unitsApi } from '@/features/units/api/unitsApi';
import { activityCategoriesApi } from '@/features/activity-categories/api/activityCategoriesApi';
import { Process } from '@/features/processes/types';
import { Unit } from '@/features/units/types';
import { ActivityCategory } from '@/features/activity-categories/types';

import { ActivityFilters } from '../types';

// ----------------------------------------------------------------------

type Props = {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  onResetFilters: () => void;
  canReset: boolean;
};

export function ActivityTableToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  canReset,
}: Props) {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);

  useEffect(() => {
    // Fetch processes, units, and categories for filters
    const fetchOptions = async () => {
      try {
        const [processesRes, unitsRes, categoriesRes] = await Promise.all([
          processesApi.getAll({ limit: 100, isActive: true }),
          unitsApi.getAll({ limit: 100, isActive: true }),
          activityCategoriesApi.getAll({ limit: 100, isActive: true }),
        ]);
        setProcesses(Array.isArray(processesRes) ? processesRes : processesRes?.data ?? []);
        setUnits(Array.isArray(unitsRes) ? unitsRes : unitsRes?.data ?? []);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data ?? []));
      } catch (error) {
        // Silently fail - filters will just be empty
      }
    };
    fetchOptions();
  }, []);

  const handleFilterSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, search: event.target.value });
    },
    [filters, onFiltersChange]
  );

  const handleFilterProcess = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, processId: value });
    },
    [filters, onFiltersChange]
  );

  const handleFilterCategory = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, categoryId: value });
    },
    [filters, onFiltersChange]
  );

  const handleFilterUnit = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, unitId: value });
    },
    [filters, onFiltersChange]
  );

  const handleFilterStatus = useCallback(
    (value: 'all' | boolean) => {
      onFiltersChange({ ...filters, isActive: value });
    },
    [filters, onFiltersChange]
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
          placeholder="جستجو بر اساس نام یا کد..."
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

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>دسته‌بندی</InputLabel>
          <Select
            value={filters.categoryId || ''}
            label="دسته‌بندی"
            onChange={(e) => handleFilterCategory(e.target.value)}
          >
            <MenuItem value="">همه</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>فرآیند</InputLabel>
          <Select
            value={filters.processId || ''}
            label="فرآیند"
            onChange={(e) => handleFilterProcess(e.target.value)}
          >
            <MenuItem value="">همه</MenuItem>
            {processes.map((process) => (
              <MenuItem key={process.id} value={process.id}>
                {process.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>واحد</InputLabel>
          <Select
            value={filters.unitId || ''}
            label="واحد"
            onChange={(e) => handleFilterUnit(e.target.value)}
          >
            <MenuItem value="">همه</MenuItem>
            {units.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.name} {unit.symbol ? `(${unit.symbol})` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>وضعیت</InputLabel>
          <Select
            value={filters.isActive === 'all' ? 'all' : filters.isActive ? 'active' : 'inactive'}
            label="وضعیت"
            onChange={(e) => {
              const value = e.target.value;
              handleFilterStatus(
                value === 'all' ? 'all' : value === 'active' ? true : false
              );
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




