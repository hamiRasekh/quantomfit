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

import { Label } from '@/components/ui/label';
import { Iconify } from '@/components/ui/iconify';
import { CustomPopover } from '@/components/ui/custom-popover';

import { Product } from '../types';
import { paths } from '@/shared/routes/paths';

// ----------------------------------------------------------------------

type Props = {
  row: Product;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onEditRow: () => void;
};

export function ProductTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
}: Props) {
  const menuActions = usePopover();
  const router = useRouter();

  const handleViewRow = () => {
    router.push(paths.dashboard.products.details(row.id));
    menuActions.onClose();
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem onClick={handleViewRow}>
          <Iconify icon="solar:eye-bold" width={20} style={{ marginInlineEnd: 8 }} />
          مشاهده
        </MenuItem>

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
            {row.code}
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ typography: 'subtitle2' }}>{row.name}</Box>
        </TableCell>

        <TableCell>{row.category?.name || '-'}</TableCell>

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




