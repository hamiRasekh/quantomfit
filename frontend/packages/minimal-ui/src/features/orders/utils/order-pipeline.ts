import { Order, OrderStatus } from '../types';

const TERMINAL_STATUSES: OrderStatus[] = [
  OrderStatus.CANCELLED,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
];

/** سفارش‌هایی که هنوز به پایان مسیر (تحویل/لغو/اتمام) نرسیده‌اند */
export function isUnfinishedOrder(order: Order): boolean {
  return !TERMINAL_STATUSES.includes(order.status);
}

export function filterUnfinishedOrders(orders: Order[]): Order[] {
  return orders.filter(isUnfinishedOrder);
}

/** نزدیک‌ترین تحویل و سپس قدیمی‌ترین ثبت */
export function sortPipelineOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const aDelivery = a.deliveryDate ? new Date(a.deliveryDate).getTime() : Number.POSITIVE_INFINITY;
    const bDelivery = b.deliveryDate ? new Date(b.deliveryDate).getTime() : Number.POSITIVE_INFINITY;
    if (aDelivery !== bDelivery) return aDelivery - bDelivery;
    return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
  });
}

export function getPipelineOrders(orders: Order[], limit = 10): Order[] {
  return sortPipelineOrders(filterUnfinishedOrders(orders)).slice(0, limit);
}
