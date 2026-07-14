export interface DefectReportSummary {
  totalDefectQuantity: number;
  totalWasteQuantity: number;
  totalRecords: number;
  byReason: Array<{
    reason: string;
    quantity: number;
    count: number;
  }>;
  byActivity: Array<{
    activityId: string;
    activity?: {
      id: string;
      name: string;
    };
    quantity: number;
    count: number;
  }>;
  byProduct: Array<{
    productId: string;
    product?: {
      id: string;
      name: string;
      code: string;
    };
    quantity: number;
    count: number;
  }>;
}

export interface DefectReportParams {
  fromDate?: string;
  toDate?: string;
  productId?: string;
  activityId?: string;
}




