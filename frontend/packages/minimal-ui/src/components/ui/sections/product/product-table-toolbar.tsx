import type { IProductTableFilters } from '@/types/product';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { CustomToolbarSettingsButtonProps } from '@/components/ui/custom-data-grid';

import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import { Toolbar } from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { Iconify } from '@/components/ui/iconify';
import {
  ToolbarContainer,
  ToolbarLeftPanel,
  ToolbarRightPanel,
  CustomToolbarQuickFilter,
  CustomToolbarExportButton,
  CustomToolbarFilterButton,
  CustomToolbarColumnsButton,
  CustomToolbarSettingsButton,
} from '@/components/ui/custom-data-grid';

import { ProductTableFiltersResult } from './product-table-filters-result';

// ----------------------------------------------------------------------

type FilterOption = {
  value: string;
  label: string;
};

type Props = CustomToolbarSettingsButtonProps & {
  canReset: boolean;
  filteredResults: number;
  selectedRowCount: number;
  filters: UseSetStateReturn<IProductTableFilters>;
  options: {
    stocks?: FilterOption[];
    publishs: FilterOption[];
  };
  onOpenConfirmDeleteRows: () => void;
};

export function ProductTableToolbar({
  options,
  filters,
  canReset,
  filteredResults,
  selectedRowCount,
  onOpenConfirmDeleteRows,
  /********/
  settings,
  onChangeSettings,
}: Props) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const [publish, setPublish] = useState<string[]>(currentFilters.publish || []);

  const handleSelect = useCallback(
    (setter: (value: string[]) => void) => (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value;
      const parsedValue = typeof value === 'string' ? value.split(',') : value;

      setter(parsedValue);
    },
    []
  );

  const renderLeftPanel = () => (
    <>
      {options.stocks && options.stocks.length > 0 && (
        <FilterSelect
          label="Stock"
          value={currentFilters.stock || []}
          options={options.stocks}
          onChange={handleSelect((value: string[] | string) => {
            const newStock = Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',') : []);
            updateFilters({ stock: newStock });
          })}
          onApply={() => { }}
        />
      )}

      <FilterSelect
        label="Publish"
        value={publish}
        options={options.publishs || []}
        onChange={handleSelect(setPublish)}
        onApply={() => updateFilters({ publish })}
      />

      <CustomToolbarQuickFilter />
    </>
  );

  const renderRightPanel = () => (
    <>
      {!!selectedRowCount && (
        <Button
          size="small"
          color="error"
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          onClick={onOpenConfirmDeleteRows}
        >
          Delete ({selectedRowCount})
        </Button>
      )}

      <CustomToolbarColumnsButton />
      <CustomToolbarFilterButton />
      <CustomToolbarExportButton />
      <CustomToolbarSettingsButton settings={settings} onChangeSettings={onChangeSettings} />
    </>
  );

  return (
    <>
      <Toolbar>
        <ToolbarContainer>
          <ToolbarLeftPanel>{renderLeftPanel()}</ToolbarLeftPanel>
          <ToolbarRightPanel>{renderRightPanel()}</ToolbarRightPanel>
        </ToolbarContainer>
      </Toolbar>

      {canReset && (
        <ProductTableFiltersResult
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

type FilterSelectProps = {
  label: string;
  value: string[];
  options: FilterOption[];
  onChange: (event: SelectChangeEvent<string[]>) => void;
  onApply: () => void;
};

function FilterSelect({ label, value, options, onChange, onApply }: FilterSelectProps) {
  const id = `filter-${label.toLowerCase()}-select`;

  // Handle empty or undefined options
  if (!options || !Array.isArray(options) || options.length === 0) {
    return null;
  }

  return (
    <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Select
        multiple
        label={label}
        value={value}
        onChange={onChange}
        onClose={onApply}
        renderValue={(selected) => {
          const output = options
            .filter((opt) => selected.includes(opt.value))
            .map((opt) => opt.label);

          return output.join(', ');
        }}
        inputProps={{ id }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox
              disableRipple
              size="small"
              checked={value.includes(option.value)}
              slotProps={{ input: { id: `${option.value}-checkbox` } }}
            />
            {option.label}
          </MenuItem>
        ))}

        <MenuItem
          onClick={onApply}
          sx={(theme) => ({
            justifyContent: 'center',
            fontWeight: theme.typography.button,
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
          })}
        >
          Apply
        </MenuItem>
      </Select>
    </FormControl>
  );
}
