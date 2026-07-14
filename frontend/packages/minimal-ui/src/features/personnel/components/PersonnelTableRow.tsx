'use client';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Label } from '@/components/ui/label';
import { Iconify } from '@/components/ui/iconify';
import { ConfirmDialog } from '@/components/ui/custom-dialog';
import { CustomPopover } from '@/components/ui/custom-popover';

import { Personnel } from '../types';

// ----------------------------------------------------------------------

type Props = {
  row: Personnel;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onEditRow: () => void;
  onViewRow: (id: string) => void;
};

export function PersonnelTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onViewRow,
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
            onViewRow(row.id);
            menuActions.onClose();
          }}
        >
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
          <Box sx={{ typography: 'subtitle2' }}>{row.firstName}</Box>
        </TableCell>

        <TableCell>
          <Box sx={{ typography: 'subtitle2' }}>{row.lastName}</Box>
        </TableCell>

        <TableCell>{row.mobile}</TableCell>

        <TableCell>{row.nationalId || '-'}</TableCell>

        <TableCell>
          <Box>
            {row.position?.name || '-'}
            {row.processes && row.processes.length > 0 && (
              <Box component="span" sx={{ typography: 'caption', color: 'text.secondary', display: 'block' }}>
                {row.processes.length} فرآیند
              </Box>
            )}
          </Box>
        </TableCell>

        <TableCell>
          <Box>
            <Label
              variant="soft"
              color={row.isActive ? 'success' : 'default'}
            >
              {row.isActive ? 'فعال' : 'غیرفعال'}
            </Label>
            {row.salaryType && (
              <Box component="span" sx={{ typography: 'caption', color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {row.salaryType === 'MONTHLY' ? 'ماهانه' : row.salaryType === 'DAILY' ? 'روزانه' : 'ساعتی'}
                {row.baseSalary > 0 && (
                  <Box component="span" sx={{ mr: 0.5 }}>
                    {' - '}
                    {new Intl.NumberFormat('fa-IR').format(row.baseSalary)} ریال
                  </Box>
                )}
              </Box>
            )}
          </Box>
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

