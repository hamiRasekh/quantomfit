'use client';

import { usePopover } from 'minimal-shared/hooks';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import { Label } from '@/components/ui/label';
import { Iconify } from '@/components/ui/iconify';
import { CustomPopover } from '@/components/ui/custom-popover';

import { Customer } from '../types';

type Props = {
    row: Customer;
    selected: boolean;
    onSelectRow: () => void;
    onDeleteRow: () => void;
    onEditRow: () => void;
};

export function CustomerTableRow({
    row,
    selected,
    onSelectRow,
    onDeleteRow,
    onEditRow,
}: Props) {
    const menuActions = usePopover();

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
        >
            <MenuList>
                <MenuItem
                    onClick={() => {
                        onEditRow();
                        menuActions.onClose();
                    }}
                >
                    <Iconify icon="solar:pen-bold" width={20} sx={{ mr: 1 }} />
                    ویرایش
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onDeleteRow();
                        menuActions.onClose();
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <Iconify icon="solar:trash-bin-trash-bold" width={20} sx={{ mr: 1 }} />
                    حذف
                </MenuItem>
            </MenuList>
        </CustomPopover>
    );

    return (
        <>
            <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
                <TableCell padding="checkbox">
                    <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
                </TableCell>

                <TableCell>
                    <Box sx={{ typography: 'subtitle2' }}>{row.name}</Box>
                </TableCell>

                <TableCell>{row.mobile || '-'}</TableCell>

                <TableCell>{row.address || '-'}</TableCell>

                <TableCell>{row.balance?.toLocaleString() || '0'}</TableCell>

                <TableCell>
                    {row.contractFileName ? (
                        <Button
                            component="a"
                            href={`/uploads/contracts/${row.contractFileName}`}
                            target="_blank"
                            rel="noreferrer"
                            size="small"
                            variant="outlined"
                        >
                            دانلود
                        </Button>
                    ) : (
                        '-'
                    )}
                </TableCell>

                <TableCell>
                    <Label
                        variant="soft"
                        color={row.isActive ? 'success' : 'default'}
                    >
                        {row.isActive ? 'فعال' : 'غیرفعال'}
                    </Label>
                </TableCell>

                <TableCell align="right">
                    <IconButton onClick={menuActions.onOpen}>
                        <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                </TableCell>
            </TableRow>

            {renderMenuActions()}
        </>
    );
}
