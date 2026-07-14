'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

import { AttributeValueFilters } from '../types';

type Props = {
  filters: AttributeValueFilters;
  onFiltersChange: (filters: AttributeValueFilters) => void;
  onResetFilters: () => void;
};

export function AttributeValueTableFiltersResult({ filters, onFiltersChange, onResetFilters }: Props) {
  const handleRemoveSearch = () => onFiltersChange({ ...filters, search: '' });
  const handleRemoveStatus = () => onFiltersChange({ ...filters, isActive: 'all' });

  return (
    <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
      {filters.search && <Chip label={`جستجو: ${filters.search}`} onDelete={handleRemoveSearch} />}
      {filters.isActive !== 'all' && (
        <Chip label={`وضعیت: ${filters.isActive ? 'فعال' : 'غیرفعال'}`} onDelete={handleRemoveStatus} />
      )}
      {(filters.search || filters.isActive !== 'all') && (
        <Chip color="default" variant="outlined" label="پاک کردن همه" onClick={onResetFilters} />
      )}
    </Box>
  );
}

