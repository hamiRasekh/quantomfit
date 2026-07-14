export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  DONE = 'DONE',
  COMPLETED = 'COMPLETED',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export interface Assignment {
  id: string;
  personnelId: string;
  productId: string;
  activityId: string;
  stageId?: string;
  orderId?: string;
  quantity: number;
  notes?: string;
  status: AssignmentStatus;
  startedAt?: string;
  completedAt?: string;
  approvedAt?: string;
  timerStartedAt?: string;
  workedSeconds?: number;
  returnReason?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  timeLogs?: AssignmentTimeLog[];
  personnel?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  product?: {
    id: string;
    name: string;
    code: string;
  };
  activity?: {
    id: string;
    name: string;
    code?: string;
  };
  stage?: {
    id: string;
    name: string;
  };
  variantInfo?: {
    color?: string;
    size?: string;
    code?: string;
    extra?: Record<string, any>;
  };
}

export interface CreateAssignmentDto {
  personnelId: string;
  productId: string;
  activityId: string;
  quantity: number;
  notes?: string;
  stageId?: string;
  variantColor?: string;
  variantSize?: string;
  variantCode?: string;
  orderId?: string;
}

export interface UpdateAssignmentDto {
  quantity?: number;
  notes?: string;
  status?: AssignmentStatus;
  stageId?: string;
  variantColor?: string;
  variantSize?: string;
  variantCode?: string;
}

export interface AssignmentListParams {
  page?: number;
  limit?: number;
  personnelId?: string;
  productId?: string;
  activityId?: string;
  status?: AssignmentStatus;
  fromDate?: string;
  toDate?: string;
  search?: string;
  orderId?: string;
}

export interface AssignmentFilters {
  personnelId: string;
  productId: string;
  activityId: string;
  status: AssignmentStatus | 'all';
  fromDate: string;
  toDate: string;
}

export interface AvailablePersonnel {
  id: string;
  firstName: string;
  lastName: string;
  hasProcessCapability: boolean;
  hasExperience: boolean;
  experienceCount: number;
  activeAssignmentCount: number;
  totalQuantity: number;
  workloadScore: number;
}

export enum AssignmentLogAction {
  START = 'START',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  COMPLETE = 'COMPLETE',
  APPROVE = 'APPROVE',
  RETURN = 'RETURN',
  CANCEL = 'CANCEL',
}

export interface AssignmentTimeLog {
  id: string;
  assignmentId: string;
  action: AssignmentLogAction;
  durationSeconds: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  assignment?: Assignment;
}




