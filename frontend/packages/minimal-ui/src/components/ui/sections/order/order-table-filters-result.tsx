import type { IOrderTableFilters } from '@/types/order';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { FiltersResultProps } from '@/components/ui/filters-result';
import type { IDatePickerControl } from '@/types/common';

import { useCallback, useMemo } from 'react';

import Chip from '@mui/material/Chip';
import { format } from 'date-fns-jalali';

import dayjs from 'dayjs';
import { fDateRangeShortLabel } from '@/ui/utils/format-time';
import { chipProps, FiltersBlock, FiltersResult } from '@/components/ui/filters-result';
import { useTranslate } from '@/components/ui/locales';

// ----------------------------------------------------------------------

type Props = FiltersResultProps & {
  onResetPage: () => void;
  filters: UseSetStateReturn<IOrderTableFilters>;
};

export function OrderTableFiltersResult({ filters, totalResults, onResetPage, sx }: Props) {
  const { t } = useTranslate('adminOrderProcess');
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  // Convert dates to Jalali format for display
  const jalaliDateLabel = useMemo(() => {
    if (!currentFilters.startDate || !currentFilters.endDate) {
      return '';
    }

    try {
      // AdapterDateFnsJalali returns Date objects that are already in Gregorian format internally
      // We need to convert them to Jalali for display
      let startDate: Date;
      let endDate: Date;

      if (currentFilters.startDate instanceof Date) {
        startDate = currentFilters.startDate;
      } else if (dayjs.isDayjs(currentFilters.startDate)) {
        startDate = currentFilters.startDate.toDate();
      } else {
        const dateValue = dayjs(currentFilters.startDate);
        if (!dateValue.isValid()) {
          return '';
        }
        startDate = dateValue.toDate();
      }

      if (currentFilters.endDate instanceof Date) {
        endDate = currentFilters.endDate;
      } else if (dayjs.isDayjs(currentFilters.endDate)) {
        endDate = currentFilters.endDate.toDate();
      } else {
        const dateValue = dayjs(currentFilters.endDate);
        if (!dateValue.isValid()) {
          return '';
        }
        endDate = dateValue.toDate();
      }

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return '';
      }

      // Format dates in Jalali calendar using date-fns-jalali
      const startJalali = format(startDate, 'yyyy/MM/dd');
      const endJalali = format(endDate, 'yyyy/MM/dd');

      // Check if same day
      if (startJalali === endJalali) {
        return startJalali;
      }

      // Check if same month and year
      const startYear = format(startDate, 'yyyy');
      const endYear = format(endDate, 'yyyy');
      const startMonth = format(startDate, 'MM');
      const endMonth = format(endDate, 'MM');

      if (startYear === endYear && startMonth === endMonth) {
        const startDay = format(startDate, 'dd');
        const endDay = format(endDate, 'dd');
        return `${startDay} - ${endDay} ${startMonth}/${startYear}`;
      }

      // Check if same year
      if (startYear === endYear) {
        const startDayMonth = format(startDate, 'dd/MM');
        const endDayMonth = format(endDate, 'dd/MM');
        return `${startDayMonth} - ${endDayMonth}/${startYear}`;
      }

      // Different years
      return `${startJalali} - ${endJalali}`;
    } catch {
      // Fallback to original format if conversion fails
      return fDateRangeShortLabel(currentFilters.startDate, currentFilters.endDate);
    }
  }, [currentFilters.startDate, currentFilters.endDate]);

  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    updateFilters({ name: '' });
  }, [onResetPage, updateFilters]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    updateFilters({ status: 'all' });
  }, [onResetPage, updateFilters]);

  const handleRemoveDate = useCallback(() => {
    onResetPage();
    updateFilters({ startDate: null, endDate: null });
  }, [onResetPage, updateFilters]);

  const handleReset = useCallback(() => {
    onResetPage();
    resetFilters();
  }, [onResetPage, resetFilters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label={t('filters.status')} isShow={currentFilters.status !== 'all'}>
        <Chip
          {...chipProps}
          label={currentFilters.status}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock
        label={t('filters.date')}
        isShow={Boolean(currentFilters.startDate && currentFilters.endDate)}
      >
        <Chip
          {...chipProps}
          label={jalaliDateLabel}
          onDelete={handleRemoveDate}
          sx={{ direction: 'ltr', textAlign: 'left' }}
        />
      </FiltersBlock>

      <FiltersBlock label={t('filters.keyword')} isShow={!!currentFilters.name}>
        <Chip {...chipProps} label={currentFilters.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
