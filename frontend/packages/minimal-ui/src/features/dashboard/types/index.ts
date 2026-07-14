export interface DashboardSummary {
  pendingApprovalsCount: number;
  todayRecordsCount: number;
  monthWorkMinutes: number;
  productionStatusBuckets: {
    [key: string]: number;
  };
  avgDurationPerActivity: Array<{
    name: string;
    avg: number;
  }>;
  topProductsByWorkMinutes: Array<{
    name: string;
    code: string;
    minutes: number;
  }>;
  topPersonnelByApprovedMinutes: Array<{
    name: string;
    minutes: number;
  }>;
}

export interface DashboardSummaryParams {
  fromDate?: string;
  toDate?: string;
}

export interface PendingApproval {
  id: string;
  personnelId: string;
  productId: string;
  activityId: string;
  quantityDone: number;
  durationMinutes: number;
  createdAt: string;
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
  };
}

export interface PendingApprovalsListParams {
  page?: number;
  limit?: number;
}
