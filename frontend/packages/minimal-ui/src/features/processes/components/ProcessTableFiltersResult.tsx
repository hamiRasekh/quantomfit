'use client';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from '@/components/ui/filters-result';

import { ProcessFilters } from '../types';

// ----------------------------------------------------------------------

type Props = {
  filters: ProcessFilters;
  onFiltersChange: (filters: ProcessFilters) => void;
  onResetFilters: () => void;
  totalResults?: number;
};

export function ProcessTableFiltersResult({
  filters,
  onFiltersChange,
  onResetFilters,
  totalResults = 0,
}: Props) {
  const handleRemoveSearch = useCallback(() => {
    onFiltersChange({ ...filters, search: '' });
  }, [filters, onFiltersChange]);

  const handleRemoveStatus = useCallback(() => {
    onFiltersChange({ ...filters, isActive: 'all' });
  }, [filters, onFiltersChange]);

  return (
    <FiltersResult onReset={onResetFilters} totalResults={totalResults}>
      <FiltersBlock label="جستجو:" isShow={!!filters.search}>
        <Chip {...chipProps} label={filters.search} onDelete={handleRemoveSearch} />
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




