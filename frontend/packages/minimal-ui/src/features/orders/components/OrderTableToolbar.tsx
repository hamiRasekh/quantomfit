'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '@/components/ui/iconify';

import { OrderListParams, OrderStatus } from '../types';
import { getOrderStatusLabel } from '../utils/orderStatus';

type Props = {
    filters: OrderListParams;
    onFiltersChange: (filters: OrderListParams) => void;
    onResetFilters: () => void;
    canReset: boolean;
};

export function OrderTableToolbar({
    filters,
    onFiltersChange,
    onResetFilters,
    canReset,
}: Props) {
    const handleFilterStatus = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onFiltersChange({ ...filters, status: event.target.value as OrderStatus });
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
                    select
                    label="وضعیت"
                    value={filters.status || ''}
                    onChange={handleFilterStatus}
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="">همه</MenuItem>
                    {Object.values(OrderStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                            {getOrderStatusLabel(status)}
                        </MenuItem>
                    ))}
                </TextField>

                {canReset && (
                    <IconButton onClick={onResetFilters}>
                        <Iconify icon="solar:restart-bold" />
                    </IconButton>
                )}
            </Box>
        </Box>
    );
}
