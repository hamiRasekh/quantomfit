export enum ProductionOrderType {
  SAMPLE = 'SAMPLE',
  MASS = 'MASS',
}

export enum ProductionOrderStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum ProductionStepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  SKIPPED = 'SKIPPED',
}

export interface ProductionOrderStep {
  id: string;
  productionOrderId: string;
  activityId: string;
  sequence: number;
  plannedQuantity: number;
  note?: string;
  status: ProductionStepStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  activity?: {
    id: string;
    name: string;
    code?: string;
  };
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  type: ProductionOrderType;
  productId: string;
  targetQuantity: number;
  customerName?: string;
  dueDate?: string;
  note?: string;
  status: ProductionOrderStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  product?: {
    id: string;
    name: string;
    code: string;
    color?: string;
    size?: string;
  };
  steps?: ProductionOrderStep[];
}

export interface CreateProductionOrderDto {
  type: ProductionOrderType;
  productId: string;
  targetQuantity: number;
  customerName?: string;
  dueDate?: string;
  note?: string;
  steps: CreateProductionStepDto[];
}

export interface CreateProductionStepDto {
  activityId: string;
  sequence: number;
  plannedQuantity: number;
  note?: string;
}

export interface UpdateProductionOrderDto {
  type?: ProductionOrderType;
  productId?: string;
  targetQuantity?: number;
  customerName?: string;
  dueDate?: string;
  note?: string;
}

export interface ProductionOrderListParams {
  page?: number;
  limit?: number;
  type?: ProductionOrderType;
  status?: ProductionOrderStatus;
  productId?: string;
  fromDate?: string;
  toDate?: string;
}




