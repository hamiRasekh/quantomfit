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

import { ActivityRecord, RecordStatus } from '../types';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

type Props = {
  row: ActivityRecord;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
};

export function ActivityRecordTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const menuActions = usePopover();

  const getStatusLabel = (status: RecordStatus) => {
    switch (status) {
      case RecordStatus.PENDING:
        return 'در انتظار تایید';
      case RecordStatus.APPROVED:
        return 'تایید شده';
      case RecordStatus.REJECTED:
        return 'رد شده';
      default:
        return status;
    }
  };

  const getStatusColor = (status: RecordStatus) => {
    switch (status) {
      case RecordStatus.PENDING:
        return 'warning';
      case RecordStatus.APPROVED:
        return 'success';
      case RecordStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins}د`;
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
          {row.personnel
            ? `${row.personnel.firstName} ${row.personnel.lastName}`
            : '-'}
        </TableCell>

        <TableCell>
          {row.product ? `${row.product.code} - ${row.product.name}` : '-'}
        </TableCell>

        <TableCell>{row.activity?.name || '-'}</TableCell>

        <TableCell>{row.quantityDone}</TableCell>

        <TableCell>
          {dayjs(row.startedAt).format('YYYY/MM/DD HH:mm')}
        </TableCell>

        <TableCell>
          {dayjs(row.endedAt).format('YYYY/MM/DD HH:mm')}
        </TableCell>

        <TableCell>{formatDuration(row.durationMinutes)}</TableCell>

        <TableCell>
          <Label variant="soft" color={getStatusColor(row.status)}>
            {getStatusLabel(row.status)}
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




