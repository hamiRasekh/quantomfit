import { ConcreteApplicationType } from '../constants/concrete-application-types';
import { OrderPumpType } from '../constants/pump-types';
import { Order, OrderStatus, OrderWorkflowStage } from './index';

export type OrderInvoiceKind = 'proforma' | 'final' | 'official' | 'unofficial';
export type OrderPaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OrderPaymentType = 'PREPAYMENT' | 'INSTALLMENT' | 'FINAL' | 'REFUND';

export interface OrderPayment {
  id: string;
  orderId: string;
  type: OrderPaymentType;
  amount: number;
  status: OrderPaymentStatus;
  paidAt?: string;
  referenceNumber?: string;
  notes?: string;
  order?: Order;
}

export interface OrderSchedule {
  id: string;
  orderId: string;
  plantId?: string;
  scheduledStartAt: string;
  scheduledEndAt?: string;
  plannedVolumeM3: number;
  status: string;
  notes?: string;
  order?: Order;
}

export interface OrderDispatchItem {
  id: string;
  orderId: string;
  vehicleId?: string;
  volumeM3: number;
  plannedDispatchAt?: string;
  status: string;
  order?: Order;
}

export interface OrderAlert {
  id: string;
  orderId?: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface OrdersDashboard {
  totalOrders: number;
  activeOrders: number;
  todayOrders: number;
  pendingFinancialApproval: number;
  openAlerts: number;
  statusCounts: Record<string, number>;
  totalVolumeM3: number;
  deliveredVolumeM3: number;
}

export interface OrderSalesDetail {
  order: Order & {
    remainingVolumeM3: number;
    paidAmountComputed: number;
    volumeM3?: number;
    deliveredVolumeM3?: number;
    destinationTitle?: string;
    destinationAddress?: string;
    concreteGrade?: string;
    concreteType?: 'SCC' | 'VIBRATED';
    applicationType?: ConcreteApplicationType;
    slumpMm?: number;
    pumpType?: OrderPumpType | null;
    unitPricePerM3?: number;
    specifications?: string;
    plantId?: string;
    vehicleId?: string;
    financialApprovalRequired?: boolean;
    financialApprovedAt?: string;
    prepaymentRequired?: boolean;
    prepaymentAmount?: number;
    paidAmount?: number;
    cancelReason?: string;
  };
  payments: OrderPayment[];
  schedules: OrderSchedule[];
  dispatches: OrderDispatchItem[];
  alerts: OrderAlert[];
}

export interface UpdateOrderSalesFieldsDto {
  customerId?: string;
  title?: string;
  note?: string;
  projectId?: string;
  destinationTitle?: string;
  destinationAddress?: string;
  volumeM3?: number;
  concreteGrade?: string;
  concreteType?: 'SCC' | 'VIBRATED';
  applicationType?: ConcreteApplicationType;
  slumpMm?: number;
  pumpType?: OrderPumpType | null;
  unitPricePerM3?: number;
  concreteAmount?: number;
  transportAmount?: number;
  pumpingAmount?: number;
  invoiceKind?: OrderInvoiceKind;
  specifications?: string;
  plantId?: string;
  vehicleId?: string;
  deliveryDate?: string;
  deadline?: string;
  scheduledStartAt?: string;
  prepaymentRequired?: boolean;
  prepaymentAmount?: number;
  status?: OrderStatus;
  workflowStage?: OrderWorkflowStage;
  cancelReason?: string;
}

export interface CreateConcreteOrderDto {
  customerId?: string;
  title: string;
  volumeM3: number;
  concreteGrade: string;
  concreteType?: 'SCC' | 'VIBRATED';
  applicationType: ConcreteApplicationType;
  slumpMm?: number;
  pumpType?: OrderPumpType;
  deliveryDate?: string;
  scheduledStartAt?: string;
  deadline?: string;
  destinationTitle: string;
  destinationAddress: string;
  projectId?: string;
  plantId?: string;
  unitPricePerM3?: number;
  concreteAmount?: number;
  transportAmount?: number;
  pumpingAmount?: number;
  invoiceKind?: OrderInvoiceKind;
  specifications?: string;
  note?: string;
  prepaymentRequired?: boolean;
  prepaymentAmount?: number;
}

export interface CustomerCrmProfile {
  customer: {
    id: string;
    name?: string;
    lastname?: string;
    title?: string;
    mobile?: string;
    balance: number;
    creditLimit: number;
    marketingTags?: string[];
    isActive: boolean;
  };
  stats: {
    orderCount: number;
    totalVolumeM3: number;
    totalAmount: number;
    balance: number;
    creditLimit: number;
  };
  orders: Order[];
  projects: Array<{ id: string; title: string; address?: string }>;
  followUps: Array<{ id: string; type: string; status: string; scheduledAt: string; notes?: string }>;
  notes: Array<{ id: string; content: string; createdAt: string }>;
}
