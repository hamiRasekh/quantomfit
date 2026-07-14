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
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import { Label } from '@/components/ui/label';
import { Iconify } from '@/components/ui/iconify';
import { CustomPopover } from '@/components/ui/custom-popover';
import { fDate } from '@/components/ui/utils/format-time';

import { Order, OrderStatus } from '../types';
import { paths } from '@/shared/routes/paths';
import { getOrderStatusLabel, getOrderStatusColor } from '../utils/orderStatus';

type Props = {
    row: Order;
    selected: boolean;
    onSelectRow: () => void;
    onDeleteRow: () => void;
    onEditRow: () => void;
};

export function OrderTableRow({
    row,
    selected,
    onSelectRow,
    onDeleteRow,
    onEditRow,
}: Props) {
    const menuActions = usePopover();
    const router = useRouter();

    const handleViewRow = () => {
        router.push(paths.dashboard.orders.details(row.id));
        menuActions.onClose();
    };

    const handleWageReport = () => {
        router.push(paths.dashboard.orders.reports.wages(row.id));
        menuActions.onClose();
    };

    const handleProgressReport = () => {
        router.push(paths.dashboard.orders.reports.progress(row.id));
        menuActions.onClose();
    };

    const handleMaterialsReport = () => {
        router.push(paths.dashboard.orders.reports.materials(row.id));
        menuActions.onClose();
    };

    const handleDashboard = () => {
        router.push(paths.dashboard.orders.dashboard(row.id));
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
                    مشاهده
                </MenuItem>

                <MenuItem onClick={handleDashboard}>
                    <Iconify icon="solar:chart-2-bold" width={20} sx={{ mr: 1 }} />
                    داشبورد سفارش
                </MenuItem>

                <MenuItem onClick={handleWageReport}>
                    <Iconify icon="solar:wallet-money-bold" width={20} sx={{ mr: 1 }} />
                    گزارش حقوق و دستمزد
                </MenuItem>

                <MenuItem onClick={handleProgressReport}>
                    <Iconify icon="solar:graph-up-bold" width={20} sx={{ mr: 1 }} />
                    گزارش روند انجام
                </MenuItem>

                <MenuItem onClick={handleMaterialsReport}>
                    <Iconify icon="solar:box-bold" width={20} sx={{ mr: 1 }} />
                    گزارش مواد اولیه
                </MenuItem>

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
                        {row.orderNumber}
                    </Box>
                </TableCell>

                <TableCell>{row.customer?.name || row.customerId}</TableCell>

                <TableCell>{fDate(row.orderDate)}</TableCell>

                <TableCell>{row.deliveryDate ? fDate(row.deliveryDate) : '-'}</TableCell>

                <TableCell>{row.totalAmount?.toLocaleString()}</TableCell>

                <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <LinearProgress
                                variant="determinate"
                                value={row.progressPercentage || 0}
                                sx={{ flexGrow: 1, mr: 1 }}
                                color={
                                    (row.progressPercentage || 0) >= 100
                                        ? 'success'
                                        : (row.progressPercentage || 0) > 0
                                        ? 'primary'
                                        : 'inherit'
                                }
                            />
                            <Typography variant="caption" sx={{ minWidth: 35, textAlign: 'right' }}>
                                {Math.round(row.progressPercentage || 0)}%
                            </Typography>
                        </Box>
                    </Box>
                </TableCell>

                <TableCell>
                    <Label variant="soft" color={getOrderStatusColor(row.status)}>
                        {getOrderStatusLabel(row.status)}
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
