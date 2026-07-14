'use client';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Order } from '../types';
import { OrderPayment } from '../types/sales';
import { displayDateTime, displayM3 } from '../utils/display';
import {
  depositStatusLabel,
  groupPaymentsByOrderId,
  orderPouringDateTime,
  orderProjectName,
  prepaymentStatusLabel,
} from '../utils/order-payments';

type Props = {
  orders: Order[];
  payments: OrderPayment[];
  loading?: boolean;
  showActions?: boolean;
  onAddInvoice?: (order: Order) => void;
};

export function OrderPaymentsTable({
  orders,
  payments,
  loading,
  showActions = false,
  onAddInvoice,
}: Props) {
  const paymentsByOrder = groupPaymentsByOrderId(payments);

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : orders.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>سفارشی برای نمایش وجود ندارد</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>شناسه سفارش</TableCell>
                <TableCell>نام پروژه</TableCell>
                <TableCell>حجم بتن‌ریزی</TableCell>
                <TableCell>زمان بتن‌ریزی</TableCell>
                <TableCell>وضعیت پیش‌پرداخت</TableCell>
                <TableCell>وضعیت واریز</TableCell>
                {showActions && <TableCell align="left">عملیات</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const orderPayments = paymentsByOrder[order.id] || [];
                const deposited = depositStatusLabel(order, orderPayments) === 'پرداخت شده';

                return (
                  <TableRow key={order.id} hover>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{order.orderNumber}</TableCell>
                    <TableCell>{orderProjectName(order)}</TableCell>
                    <TableCell>{displayM3(order.volumeM3)}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {displayDateTime(orderPouringDateTime(order))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={prepaymentStatusLabel(order)}
                        color={order.prepaymentRequired ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={deposited ? 'پرداخت شده' : 'پرداخت نشده'}
                        color={deposited ? 'success' : 'default'}
                        variant={deposited ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    {showActions && (
                      <TableCell align="left">
                        <Button size="small" variant="outlined" onClick={() => onAddInvoice?.(order)}>
                          افزودن فاکتور پرداخت
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
