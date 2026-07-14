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

import { ActivityCategory } from '../types';

// ----------------------------------------------------------------------

type Props = {
  row: ActivityCategory;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onEditRow: () => void;
};

export function ActivityCategoryTableRow({
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

        <TableCell>
          <Box
            component="code"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              bgcolor: 'action.hover',
              px: 1,
              py: 0.5,
              borderRadius: 0.5,
            }}
          >
            {row.code || '-'}
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ typography: 'body2' }}>
            {row.activities?.length
              ? row.activities.map((a) => a.name).join(', ')
              : '-'}
          </Box>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={row.isActive ? 'success' : 'default'}
          >
            {row.isActive ? 'فعال' : 'غیرفعال'}
          </Label>
        </TableCell>

        <TableCell>
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString('fa-IR')
            : '-'}
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

