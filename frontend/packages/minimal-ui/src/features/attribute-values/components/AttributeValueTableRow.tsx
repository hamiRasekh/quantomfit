'use client';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Label } from '@/components/ui/label';
import { Iconify } from '@/components/ui/iconify';
import { CustomPopover } from '@/components/ui/custom-popover';

import { AttributeValue } from '../types';

type Props = {
  row: AttributeValue;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onEditRow: () => void;
};

export function AttributeValueTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow }: Props) {
  const menuActions = usePopover();

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell>
          <Box sx={{ typography: 'subtitle2' }}>{row.value}</Box>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={row.isActive ? 'success' : 'default'}>
            {row.isActive ? 'فعال' : 'غیرفعال'}
          </Label>
        </TableCell>

        <TableCell>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('fa-IR') : '-'}
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={menuActions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

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
            <Iconify icon="solar:pen-bold" width={20} style={{ marginInlineEnd: 8 }} />
            ویرایش
          </MenuItem>

          <MenuItem
            onClick={() => {
              onDeleteRow();
              menuActions.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={20} style={{ marginInlineEnd: 8 }} />
            حذف
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}

