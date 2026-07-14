export interface WageReportSummary {
  totalWage: number;
  totalMinutes: number;
  totalUnits: number;
  recordCount: number;
}

export interface WageReportByPersonnel {
  personnel: {
    id: string;
    firstName: string;
    lastName: string;
  };
  wage: number;
  minutes: number;
  units: number;
}

export interface WageReportByProcess {
  processId: string;
  wage: number;
  minutes: number;
  units: number;
}

export interface WageReportByActivity {
  activity: {
    id: string;
    name: string;
    processId?: string;
    process?: {
      id: string;
      name: string;
    };
  };
  wage: number;
  minutes: number;
  units: number;
}

export interface WageReportDetail {
  personnelId: string;
  personnelName: string;
  processId: string;
  processName: string;
  activityId: string;
  activityName: string;
  approvedMinutes: number;
  rate: number;
  calculatedWage: number;
}

export interface WageReportParams {
  fromDate?: string;
  toDate?: string;
  personnelId?: string;
  processId?: string;
  activityId?: string;
}
