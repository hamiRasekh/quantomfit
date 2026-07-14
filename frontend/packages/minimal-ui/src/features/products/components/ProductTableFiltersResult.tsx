'use client';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from '@/components/ui/filters-result';

import { ProductFilters } from '../types';

// ----------------------------------------------------------------------

type Props = {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onResetFilters: () => void;
  categoryNames: Map<string, string>;
  totalResults?: number;
};

export function ProductTableFiltersResult({
  filters,
  onFiltersChange,
  onResetFilters,
  categoryNames,
  totalResults = 0,
}: Props) {
  const handleRemoveSearch = useCallback(() => {
    onFiltersChange({ ...filters, search: '' });
  }, [filters, onFiltersChange]);

  const handleRemoveCategory = useCallback(() => {
    onFiltersChange({ ...filters, categoryId: '' });
  }, [filters, onFiltersChange]);

  const handleRemoveStatus = useCallback(() => {
    onFiltersChange({ ...filters, isActive: 'all' });
  }, [filters, onFiltersChange]);

  return (
    <FiltersResult onReset={onResetFilters} totalResults={totalResults}>
      <FiltersBlock label="جستجو:" isShow={!!filters.search}>
        <Chip {...chipProps} label={filters.search} onDelete={handleRemoveSearch} />
      </FiltersBlock>

      <FiltersBlock label="دسته‌بندی:" isShow={!!filters.categoryId}>
        <Chip
          {...chipProps}
          label={categoryNames.get(filters.categoryId) || filters.categoryId}
          onDelete={handleRemoveCategory}
        />
      </FiltersBlock>

      <FiltersBlock label="وضعیت:" isShow={filters.isActive !== 'all'}>
        <Chip
          {...chipProps}
          label={filters.isActive === true ? 'فعال' : 'غیرفعال'}
          onDelete={handleRemoveStatus}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}




