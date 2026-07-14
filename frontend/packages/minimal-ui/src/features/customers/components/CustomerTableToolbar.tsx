'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '@/components/ui/iconify';

import { CustomerFilters } from '../types';

type Props = {
    filters: CustomerFilters;
    onFiltersChange: (filters: CustomerFilters) => void;
    onResetFilters: () => void;
    canReset: boolean;
};

export function CustomerTableToolbar({
    filters,
    onFiltersChange,
    onResetFilters,
    canReset,
}: Props) {
    const handleFilterSearch = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onFiltersChange({ ...filters, search: event.target.value });
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
                    fullWidth
                    value={filters.search}
                    onChange={handleFilterSearch}
                    placeholder="جستجو بر اساس نام یا موبایل..."
                    sx={{ minWidth: 200, flexGrow: 1 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
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
