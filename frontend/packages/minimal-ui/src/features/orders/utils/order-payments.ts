import { Order } from '../types';
import { OrderPayment } from '../types/sales';

export function orderPouringDateTime(order: Order): string | undefined {
  return order.deliveryDate || order.scheduledStartAt;
}

export function orderProjectName(order: Order): string {
  return order.title?.trim() || order.destinationTitle?.trim() || '—';
}

export function prepaymentStatusLabel(order: Order): string {
  return order.prepaymentRequired ? 'دارد' : 'ندارد';
}

export function requiredPaymentAmount(order: Order): number {
  const prepay = Number(order.prepaymentAmount ?? 0);
  if (order.prepaymentRequired && prepay > 0) return prepay;
  return Number(order.totalAmount ?? 0);
}

export function isOrderDepositReceived(order: Order, payments: OrderPayment[] = []): boolean {
  const paid = Number(order.paidAmount ?? 0);
  const required = requiredPaymentAmount(order);

  if (required > 0) {
    return paid >= required;
  }

  return payments.some((p) => p.status === 'APPROVED');
}

export function depositStatusLabel(order: Order, payments: OrderPayment[] = []): string {
  return isOrderDepositReceived(order, payments) ? 'پرداخت شده' : 'پرداخت نشده';
}

export function groupPaymentsByOrderId(payments: OrderPayment[]): Record<string, OrderPayment[]> {
  return payments.reduce<Record<string, OrderPayment[]>>((acc, payment) => {
    if (!payment.orderId) return acc;
    if (!acc[payment.orderId]) acc[payment.orderId] = [];
    acc[payment.orderId].push(payment);
    return acc;
  }, {});
}

export function defaultInvoiceAmount(order: Order): number {
  const required = requiredPaymentAmount(order);
  if (required > 0) return required;
  return Number(order.totalAmount ?? 0);
}

export function totalOrderRevenue(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);
}

export function totalCollectedAmount(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + Number(order.paidAmount ?? 0), 0);
}

export function totalOutstandingAmount(orders: Order[]): number {
  return orders.reduce((sum, order) => {
    const total = Number(order.totalAmount ?? 0);
    const paid = Number(order.paidAmount ?? 0);
    return sum + Math.max(0, total - paid);
  }, 0);
}

export function weeklyCollectedAmount(payments: OrderPayment[], days = 7): number {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return payments
    .filter(
      (p) =>
        p.status === 'APPROVED' &&
        p.paidAt &&
        new Date(p.paidAt).getTime() >= since,
    )
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
}

export function countUnpaidOrders(orders: Order[], payments: OrderPayment[]): number {
  const byOrder = groupPaymentsByOrderId(payments);
  return orders.filter((order) => !isOrderDepositReceived(order, byOrder[order.id] || [])).length;
}
