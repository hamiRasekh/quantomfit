'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

import { PositionFilters } from '../types';

type Props = {
  filters: PositionFilters;
  onFiltersChange: (filters: Partial<PositionFilters>) => void;
  onResetFilters: () => void;
};

export function PositionTableFiltersResult({
  filters,
  onFiltersChange,
  onResetFilters,
}: Props) {
  const handleRemoveSearch = () => {
    onFiltersChange({ search: '' });
  };

  const handleRemoveStatus = () => {
    onFiltersChange({ isActive: 'all' });
  };

  return (
    <Box
      sx={{
        gap: 1,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        px: 2,
        pb: 2,
      }}
    >
      {filters.search && (
        <Chip
          label={`جستجو: ${filters.search}`}
          onDelete={handleRemoveSearch}
          variant="soft"
        />
      )}

      {filters.isActive !== 'all' && (
        <Chip
          label={filters.isActive === true ? 'فقط فعال' : 'غیرفعال'}
          onDelete={handleRemoveStatus}
          variant="soft"
        />
      )}

      {(filters.search || filters.isActive !== 'all') && (
        <Chip
          label="حذف فیلترها"
          onDelete={onResetFilters}
          color="error"
          variant="soft"
        />
      )}
    </Box>
  );
}


