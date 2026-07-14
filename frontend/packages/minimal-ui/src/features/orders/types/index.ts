export enum OrderStatus {
    DRAFT = 'DRAFT',
    CONFIRMED = 'CONFIRMED',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    READY_TO_SHIP = 'READY_TO_SHIP',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED',
    FINANCIAL = 'FINANCIAL',
}

/** وضعیت‌های سفارش با برچسب فارسی (برای سلکت و نمایش) */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: 'پیش نویس',
    [OrderStatus.CONFIRMED]: 'تایید شده',
    [OrderStatus.PENDING]: 'در انتظار تولید',
    [OrderStatus.IN_PROGRESS]: 'در خط تولید',
    [OrderStatus.PROCESSING]: 'در حال پردازش',
    [OrderStatus.COMPLETED]: 'اتمام تولید',
    [OrderStatus.READY_TO_SHIP]: 'آماده ارسال',
    [OrderStatus.SHIPPED]: 'ارسال',
    [OrderStatus.DELIVERED]: 'تحویل داده شده',
    [OrderStatus.CANCELLED]: 'لغو',
    [OrderStatus.RETURNED]: 'بازگشت شده',
    [OrderStatus.FINANCIAL]: 'مالی',
};

/** وضعیت‌های اصلی برای سلکت (همان ۸ مورد درخواستی) */
export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
    { value: OrderStatus.DRAFT, label: 'پیش نویس' },
    { value: OrderStatus.CONFIRMED, label: 'تایید شده' },
    { value: OrderStatus.PENDING, label: 'در انتظار تولید' },
    { value: OrderStatus.IN_PROGRESS, label: 'در خط تولید' },
    { value: OrderStatus.COMPLETED, label: 'اتمام تولید' },
    { value: OrderStatus.SHIPPED, label: 'ارسال' },
    { value: OrderStatus.CANCELLED, label: 'لغو' },
    { value: OrderStatus.FINANCIAL, label: 'مالی' },
];

export interface OrderItem {
    id: string;
    productId: string;
    productName?: string; // If populated from backend
    status?: OrderStatus;
    attributeValueIds?: string[];
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    processActivities?: Array<{
        processId: string;
        activityIds?: string[];
        process?: { id: string; name: string };
    }>;
}

export enum OrderWorkflowStage {
    REGISTERED = 'REGISTERED',
    MIX_DESIGN = 'MIX_DESIGN',
    INVENTORY_CHECK = 'INVENTORY_CHECK',
    PRODUCTION_FEASIBILITY = 'PRODUCTION_FEASIBILITY',
    PRODUCTION_READY = 'PRODUCTION_READY',
}

export interface Order {
    id: string;
    orderNumber: string;
    title?: string;
    customerId?: string | null;
    customerName?: string; // If populated
    orderDate: string;
    deliveryDate?: string;
    totalAmount: number;
    concreteAmount?: number;
    transportAmount?: number;
    pumpingAmount?: number;
    invoiceKind?: 'proforma' | 'final' | 'official' | 'unofficial';
    status: OrderStatus;
    workflowStage?: OrderWorkflowStage;
    progressPercentage?: number; // 0-100
    note?: string;
    materialsSuppliedConfirmedAt?: string; // ISO date when admin confirmed
    projectId?: string;
    destinationTitle?: string;
    destinationAddress?: string;
    volumeM3?: number;
    deliveredVolumeM3?: number;
    concreteGrade?: string;
    concreteType?: 'SCC' | 'VIBRATED';
    applicationType?:
      | 'COLUMN'
      | 'FOUNDATION'
      | 'LEAN_CONCRETE'
      | 'PILE'
      | 'ROAD_FLOORING'
      | 'STAIRS'
      | 'SLAB'
      | 'WALL'
      | 'OTHER'
      | 'SPECIAL'
      | 'TANK'
      | 'POOL';
    slumpMm?: number;
    pumpType?: 'GROUND' | 'AERIAL' | 'OTHER' | null;
    unitPricePerM3?: number;
    specifications?: string;
    plantId?: string;
    vehicleId?: string;
    financialApprovalRequired?: boolean;
    financialApprovedAt?: string;
    prepaymentRequired?: boolean;
    prepaymentAmount?: number;
    paidAmount?: number;
    deadline?: string;
    scheduledStartAt?: string;
    cancelReason?: string;
    items?: OrderItem[];
    customer?: {
        id: string;
        name: string;
        mobile?: string;
    };
    /** @deprecated Use item-level processActivities; kept for backward compat */
    processActivities?: Array<{
        processId: string;
        activityIds?: string[];
        process?: { id: string; name: string };
    }>;
}

export interface OrderWageReportItem {
    record: {
        id: string;
        personnelId: string;
        productId: string;
        activityId: string;
        quantityDone: number;
        startedAt: string;
        endedAt: string;
        durationMinutes: number;
        personnel?: { id: string; firstName: string; lastName: string };
        activity?: { id: string; name: string };
        product?: { id: string; name: string };
    };
    wage: number;
    personnelName: string;
    activityName: string;
    productName: string;
}

export interface OrderWageReport {
    items: OrderWageReportItem[];
    totalWage: number;
    totalMinutes: number;
}

export interface OrderProgressReportItem {
    processId: string;
    processName: string;
    activityId: string;
    activityName: string;
    isCompleted: boolean;
}

export interface OrderProgressReport {
    items: OrderProgressReportItem[];
    totalActivities: number;
    completedActivities: number;
    progressPercentage: number;
}

export interface OrderMaterialsReportItem {
    rawMaterialId: string;
    rawMaterialName: string;
    rawMaterialCode: string;
    unitId: string;
    unitName: string;
    requiredQuantity: number;
    currentStock: number;
    shortage: number;
}

export interface OrderMaterialsReport {
    items: OrderMaterialsReportItem[];
    totalMaterials: number;
    materialsWithShortage: number;
}

export interface CreateOrderItemProcessActivityDto {
    processId: string;
    activityIds?: string[];
}

export interface CreateOrderItemDto {
    productId: string;
    attributeValueIds?: string[];
    quantity: number;
    unitPrice?: number;
    processActivities?: CreateOrderItemProcessActivityDto[];
}

export interface CreateOrderProcessActivityDto {
    processId: string;
    activityIds?: string[];
}

export interface ProcessActivitiesByCategoryItem {
    processId: string;
    activityIds: string[];
}

export interface CreateOrderDto {
    customerId?: string | null;
    title?: string;
    deliveryDate?: string;
    note?: string;
    items: CreateOrderItemDto[];
}

export interface UpdateOrderDto {
    status?: OrderStatus;
    title?: string;
    note?: string;
    deliveryDate?: string;
    items?: CreateOrderItemDto[];
}

export interface OrderListParams {
    page?: number;
    limit?: number;
    status?: OrderStatus;
}

export interface OrderWithPriority extends Order {
    priority: number;
    priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    productCount: number;
    activityCount: number;
    processCount: number;
    daysUntilDelivery: number | null;
}

export interface OrderActivityProgress {
    processId: string;
    processName: string;
    activityId: string;
    activityName: string;
    totalProducts: number;
    completedProducts: number;
    progressPercentage: number;
}
