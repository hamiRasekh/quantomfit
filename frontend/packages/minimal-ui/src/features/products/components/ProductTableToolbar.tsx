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
import { productCategoriesApi } from '@/features/product-categories/api/productCategoriesApi';
import { ProductCategory } from '@/features/product-categories/types';

import { ProductFilters } from '../types';

// ----------------------------------------------------------------------

type Props = {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onResetFilters: () => void;
  canReset: boolean;
};

export function ProductTableToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  canReset,
}: Props) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productCategoriesApi.getAll({ limit: 100, isActive: true });
        setCategories(response.data);
      } catch (error) {
        // Silently fail
      }
    };
    fetchCategories();
  }, []);

  const handleFilterSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, search: event.target.value });
    },
    [filters, onFiltersChange]
  );

  const handleFilterCategory = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, categoryId: value });
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
          placeholder="جستجو بر اساس نام، کد یا مشتری..."
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




