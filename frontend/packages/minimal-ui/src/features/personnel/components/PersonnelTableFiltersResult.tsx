'use client';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from '@/components/ui/filters-result';

import { PersonnelFilters } from '../types';

// ----------------------------------------------------------------------

type Props = {
  filters: PersonnelFilters;
  onFiltersChange: (filters: Partial<PersonnelFilters>) => void;
  onResetFilters: () => void;
  positionOptions: { label: string; value: string }[];
  totalResults?: number;
};

export function PersonnelTableFiltersResult({
  filters,
  onFiltersChange,
  onResetFilters,
  positionOptions,
  totalResults = 0,
}: Props) {
  const handleRemoveSearch = useCallback(() => {
    onFiltersChange({ search: '' });
  }, [onFiltersChange]);

  const handleRemoveStatus = useCallback(() => {
    onFiltersChange({ isActive: 'all' });
  }, [onFiltersChange]);

  const handleRemovePosition = useCallback(() => {
    onFiltersChange({ positionId: '' });
  }, [onFiltersChange]);

  const positionLabel =
    positionOptions.find((option) => option.value === filters.positionId)?.label;

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

      <FiltersBlock label="سمت:" isShow={!!filters.positionId}>
        <Chip
          {...chipProps}
          label={positionLabel ?? ''}
          onDelete={handleRemovePosition}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}




