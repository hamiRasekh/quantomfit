export interface OverheadReportSummary {
  wageSummary: {
    totalWage: number;
    totalMinutes: number;
    totalUnits: number;
    recordCount: number;
  };
  activeRule: {
    type: 'PERCENT_OF_WAGE' | 'FIXED_PER_HOUR';
    value: string;
  } | null;
  totalOverhead: number;
}

export interface OverheadReportByProcess {
  processId: string;
  process?: {
    id: string;
    name: string;
  };
  wage: number;
  minutes: number;
  overhead: number;
}

export interface OverheadReportParams {
  fromDate?: string;
  toDate?: string;
  processId?: string;
}




