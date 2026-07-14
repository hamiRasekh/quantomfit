'use client';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from '@/components/ui/filters-result';

import { ActivityFilters } from '../types';

// ----------------------------------------------------------------------

type Props = {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  onResetFilters: () => void;
  processNames: Map<string, string>;
  categoryNames: Map<string, string>;
  unitNames: Map<string, string>;
  totalResults?: number;
};

export function ActivityTableFiltersResult({
  filters,
  onFiltersChange,
  onResetFilters,
  processNames,
  categoryNames,
  unitNames,
  totalResults = 0,
}: Props) {
  const handleRemoveSearch = useCallback(() => {
    onFiltersChange({ ...filters, search: '' });
  }, [filters, onFiltersChange]);

  const handleRemoveProcess = useCallback(() => {
    onFiltersChange({ ...filters, processId: '' });
  }, [filters, onFiltersChange]);

  const handleRemoveCategory = useCallback(() => {
    onFiltersChange({ ...filters, categoryId: '' });
  }, [filters, onFiltersChange]);

  const handleRemoveUnit = useCallback(() => {
    onFiltersChange({ ...filters, unitId: '' });
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

      <FiltersBlock label="فرآیند:" isShow={!!filters.processId}>
        <Chip
          {...chipProps}
          label={processNames.get(filters.processId) || filters.processId}
          onDelete={handleRemoveProcess}
        />
      </FiltersBlock>

      <FiltersBlock label="واحد:" isShow={!!filters.unitId}>
        <Chip
          {...chipProps}
          label={unitNames.get(filters.unitId) || filters.unitId}
          onDelete={handleRemoveUnit}
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




