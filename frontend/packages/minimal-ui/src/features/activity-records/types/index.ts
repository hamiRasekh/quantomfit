export enum RecordStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ActivityRecord {
  id: string;
  assignmentId?: string;
  personnelId: string;
  productId: string;
  activityId: string;
  quantityDone: number;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  status: RecordStatus;
  managerNote?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  assignment?: {
    id: string;
    quantity: number;
  };
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
}

export interface CreateActivityRecordDto {
  assignmentId?: string;
  personnelId: string;
  productId: string;
  activityId: string;
  quantityDone: number;
  startedAt: string;
  endedAt: string;
}

export interface UpdateActivityRecordDto {
  assignmentId?: string;
  quantityDone?: number;
  startedAt?: string;
  endedAt?: string;
}

export interface ActivityRecordListParams {
  page?: number;
  limit?: number;
  personnelId?: string;
  productId?: string;
  activityId?: string;
  status?: RecordStatus;
  fromDate?: string;
  toDate?: string;
}

export interface ActivityRecordFilters {
  personnelId: string;
  productId: string;
  activityId: string;
  status: RecordStatus | 'all';
  fromDate: string;
  toDate: string;
}




