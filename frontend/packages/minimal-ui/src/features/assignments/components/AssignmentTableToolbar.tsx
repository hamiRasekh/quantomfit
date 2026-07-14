'use client';

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '@/components/ui/iconify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { personnelApi } from '@/features/personnel/api/personnelApi';
import { productsApi } from '@/features/products/api/productsApi';
import { activitiesApi } from '@/features/activities/api/activitiesApi';
import { Personnel } from '@/features/personnel/types';
import { Product } from '@/features/products/types';
import { Activity } from '@/features/activities/types';
import { useTranslate } from '@/components/ui/locales/use-locales';
import { formatDatePickerValue, toDatePickerValue } from '@/lib/utils/date-helpers';

import { AssignmentFilters, AssignmentStatus } from '../types';

// ----------------------------------------------------------------------

type Props = {
  filters: AssignmentFilters;
  onFiltersChange: (filters: AssignmentFilters) => void;
  onResetFilters: () => void;
  canReset: boolean;
};

export function AssignmentTableToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  canReset,
}: Props) {
  const { currentLang } = useTranslate();
  const preferDate = currentLang?.value === 'fa';
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [personnelRes, productsRes, activitiesRes] = await Promise.all([
          personnelApi.getAll({ limit: 100 }), // Reduced from 1000 for better performance
          productsApi.getAll({ limit: 100 }), // Reduced from 1000 for better performance
          activitiesApi.getAll({ limit: 100, isActive: true }), // Reduced from 1000 for better performance
        ]);
        setPersonnel(personnelRes.data);
        setProducts(productsRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        // Silently fail
      }
    };
    fetchOptions();
  }, []);

  const handleFilterChange = useCallback(
    (field: keyof AssignmentFilters, value: any) => {
      onFiltersChange({ ...filters, [field]: value });
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
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>پرسنل</InputLabel>
          <Select
            value={filters.personnelId || ''}
            label="پرسنل"
            onChange={(e) => handleFilterChange('personnelId', e.target.value)}
          >
            <MenuItem value="">همه</MenuItem>
            {personnel.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>محصول</InputLabel>
          <Select
            value={filters.productId || ''}
            label="محصول"
            onChange={(e) => handleFilterChange('productId', e.target.value)}
          >
            <MenuItem value="">همه</MenuItem>
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.code} - {product.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>فعالیت</InputLabel>
          <Select
            value={filters.activityId || ''}
            label="فعالیت"
            onChange={(e) => handleFilterChange('activityId', e.target.value)}
          >
            <MenuItem value="">همه</MenuItem>
            {activities.map((activity) => (
              <MenuItem key={activity.id} value={activity.id}>
                {activity.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>وضعیت</InputLabel>
          <Select
            value={filters.status === 'all' ? 'all' : filters.status}
            label="وضعیت"
            onChange={(e) =>
              handleFilterChange('status', e.target.value === 'all' ? 'all' : e.target.value)
            }
          >
            <MenuItem value="all">همه</MenuItem>
            <MenuItem value={AssignmentStatus.ASSIGNED}>واگذار شده</MenuItem>
            <MenuItem value={AssignmentStatus.IN_PROGRESS}>در حال انجام</MenuItem>
            <MenuItem value={AssignmentStatus.DONE}>انجام شده</MenuItem>
            <MenuItem value={AssignmentStatus.CANCELLED}>لغو شده</MenuItem>
          </Select>
        </FormControl>

        <DatePicker
          label="از تاریخ"
          value={toDatePickerValue(filters.fromDate, preferDate)}
          onChange={(newValue) => handleFilterChange('fromDate', formatDatePickerValue(newValue))}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
        />

        <DatePicker
          label="تا تاریخ"
          value={toDatePickerValue(filters.toDate, preferDate)}
          onChange={(newValue) => handleFilterChange('toDate', formatDatePickerValue(newValue))}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
        />

        {canReset && (
          <IconButton onClick={onResetFilters}>
            <Iconify icon="solar:restart-bold" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

