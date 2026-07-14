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

import { CodingRule, CodingRuleEntityType } from '../types';

// ----------------------------------------------------------------------

type Props = {
  row: CodingRule;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onEditRow: () => void;
  onToggleActive: () => void;
};

export function CodingRuleTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onToggleActive,
}: Props) {
  const menuActions = usePopover();

  const getEntityTypeLabel = (type: CodingRuleEntityType) => {
    switch (type) {
      case CodingRuleEntityType.PRODUCT:
        return 'محصول';
      case CodingRuleEntityType.RAW_MATERIAL:
        return 'مواد اولیه';
      default:
        return type;
    }
  };

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
            onToggleActive();
            menuActions.onClose();
          }}
        >
          <Iconify
            icon={row.isActive ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
            width={20}
            style={{ marginInlineEnd: 8 }}
          />
          {row.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
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

        <TableCell>{getEntityTypeLabel(row.entityType)}</TableCell>

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
            {row.pattern}
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
          <Box
            sx={{
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.description || '-'}
          </Box>
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




