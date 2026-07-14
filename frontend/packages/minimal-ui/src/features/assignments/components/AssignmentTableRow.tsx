'use client';

import { useState, useEffect } from 'react';
import { usePopover } from 'minimal-shared/hooks';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Label } from '@/components/ui/label';
import { Iconify } from '@/components/ui/iconify';
import { CustomPopover } from '@/components/ui/custom-popover';

import { Assignment, AssignmentStatus } from '../types';
import { paths } from '@/shared/routes/paths';

// ----------------------------------------------------------------------

function formatDuration(seconds: number): string {
  if (seconds < 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ساعت`);
  if (m > 0) parts.push(`${m} دقیقه`);
  if (s > 0 || parts.length === 0) parts.push(`${s} ثانیه`);
  return parts.join(' و ');
}

/** تایمر زنده از startedAt + workedSeconds یا از timerStartedAt تا الان */
function useElapsedSeconds(row: Assignment): number {
  const [tick, setTick] = useState(0);
  const isLive =
    row.status === AssignmentStatus.IN_PROGRESS &&
    row.timerStartedAt;

  useEffect(() => {
    if (!isLive) return undefined;
    const interval = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [isLive, row.id]);

  const base = row.workedSeconds ?? 0;
  if (row.status === AssignmentStatus.IN_PROGRESS && row.timerStartedAt) {
    const from = new Date(row.timerStartedAt).getTime();
    return base + Math.max(0, Math.floor((Date.now() - from) / 1000));
  }
  if (row.status === AssignmentStatus.PAUSED) {
    return base;
  }
  if (row.status === AssignmentStatus.COMPLETED || row.status === AssignmentStatus.APPROVED) {
    const start = row.startedAt ? new Date(row.startedAt).getTime() : (row.createdAt ? new Date(row.createdAt).getTime() : 0);
    const end = row.completedAt ? new Date(row.completedAt).getTime() : Date.now();
    return Math.max(0, Math.floor((end - start) / 1000));
  }
  if (row.status === AssignmentStatus.ASSIGNED && row.startedAt) {
    const from = new Date(row.startedAt).getTime();
    return base + Math.max(0, Math.floor((Date.now() - from) / 1000));
  }
  return base;
}

// ----------------------------------------------------------------------

type Props = {
  row: Assignment;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onCancelRow: () => void;
  onApproveRow: () => void;
  onReturnRow: () => void;
  onCompleteRow: () => void;
  /** نمایش الرت «تایید شد» روی ردیف بلافاصله بعد از تایید */
  isJustApproved?: boolean;
  /** نمایش الرت «تکمیل شد» روی ردیف بلافاصله بعد از تکمیل */
  isJustCompleted?: boolean;
  /** تعداد ستون‌های جدول برای colspan الرت */
  tableColSpan?: number;
};

export function AssignmentTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onCancelRow,
  onApproveRow,
  onReturnRow,
  onCompleteRow,
  isJustApproved = false,
  isJustCompleted = false,
  tableColSpan = 9,
}: Props) {
  const menuActions = usePopover();
  const router = useRouter();
  const elapsedSeconds = useElapsedSeconds(row);

  const getStatusLabel = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.ASSIGNED:
        return 'واگذار شده';
      case AssignmentStatus.IN_PROGRESS:
        return 'در خط تولید';
      case AssignmentStatus.PAUSED:
        return 'متوقف شده';
      case AssignmentStatus.AWAITING_APPROVAL:
        return 'در انتظار تایید';
      case AssignmentStatus.APPROVED:
        return 'تایید شده';
      case AssignmentStatus.RETURNED:
        return 'برگشت داده شده';
      case AssignmentStatus.COMPLETED:
        return 'تکمیل شده';
      case AssignmentStatus.DONE:
        return 'انجام شده';
      case AssignmentStatus.CANCELLED:
        return 'لغو شده';
      default:
        return status;
    }
  };

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.ASSIGNED:
        return 'info';
      case AssignmentStatus.IN_PROGRESS:
        return 'warning';
      case AssignmentStatus.PAUSED:
        return 'default';
      case AssignmentStatus.AWAITING_APPROVAL:
        return 'info';
      case AssignmentStatus.APPROVED:
        return 'success';
      case AssignmentStatus.RETURNED:
        return 'error';
      case AssignmentStatus.COMPLETED:
        return 'success';
      case AssignmentStatus.DONE:
        return 'success';
      case AssignmentStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewRow = () => {
    router.push(paths.dashboard.assignments.details(row.id));
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
          <Iconify icon="solar:eye-bold" width={20} sx={{ mr: 1 }} />
          مشاهده جزئیات
        </MenuItem>

        {row.status !== AssignmentStatus.CANCELLED &&
          row.status !== AssignmentStatus.DONE &&
          row.status !== AssignmentStatus.APPROVED &&
          row.status !== AssignmentStatus.COMPLETED && (
            <MenuItem
              onClick={() => {
                onCancelRow();
                menuActions.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:close-circle-bold" width={20} sx={{ mr: 1 }} />
              لغو واگذاری
            </MenuItem>
          )}

        {(row.status === AssignmentStatus.ASSIGNED ||
          row.status === AssignmentStatus.IN_PROGRESS ||
          row.status === AssignmentStatus.PAUSED) && (
          <MenuItem
            onClick={() => {
              onCompleteRow();
              menuActions.onClose();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="solar:check-circle-bold" width={20} sx={{ mr: 1 }} />
            تکمیل واگذاری
          </MenuItem>
        )}

        {row.status === AssignmentStatus.AWAITING_APPROVAL && (
          <>
            <MenuItem
              onClick={() => {
                onApproveRow();
                menuActions.onClose();
              }}
              sx={{ color: 'success.main' }}
            >
              <Iconify icon="solar:check-circle-bold" width={20} sx={{ mr: 1 }} />
              تایید تسک
            </MenuItem>
            <MenuItem
              onClick={() => {
                onReturnRow();
                menuActions.onClose();
              }}
              sx={{ color: 'warning.main' }}
            >
              <Iconify icon="solar:undo-left-round-bold" width={20} sx={{ mr: 1 }} />
              بازگشت به کاربر
            </MenuItem>
          </>
        )}

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
      {(isJustApproved || isJustCompleted) && (
        <TableRow>
          <TableCell colSpan={tableColSpan} sx={{ py: 0.5, verticalAlign: 'top' }}>
            <Alert severity="success" sx={{ py: 0.5 }}>
              {isJustApproved ? 'تایید شد' : 'تکمیل شد'}
            </Alert>
          </TableCell>
        </TableRow>
      )}
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

        <TableCell>{row.quantity}</TableCell>

        <TableCell>
          <Label variant="soft" color={getStatusColor(row.status)}>
            {getStatusLabel(row.status)}
          </Label>
        </TableCell>

        <TableCell>
          {(row.status === AssignmentStatus.IN_PROGRESS ||
            row.status === AssignmentStatus.PAUSED ||
            row.status === AssignmentStatus.COMPLETED ||
            row.status === AssignmentStatus.APPROVED ||
            (row.status === AssignmentStatus.ASSIGNED && row.startedAt)) &&
          elapsedSeconds >= 0
            ? formatDuration(elapsedSeconds)
            : '—'}
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




