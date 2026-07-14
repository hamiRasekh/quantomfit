import { Personnel } from '@/features/personnel/types';

export type HrDashboard = {
  total: number;
  active: number;
  drivers: number;
  openAlerts: number;
  pendingLeave: number;
};

export type HrSummaryReport = {
  headcount: number;
  active: number;
  inactive: number;
  drivers: number;
  totalPayrollNet: number;
  payrollRecordCount: number;
  openAlerts: number;
  pendingLeave: number;
  attendanceRecords: number;
};

export type Department = { id: string; name: string; code?: string; description?: string };

export type DepartmentPosition = {
  id: string;
  name: string;
  code?: string;
  isDriverRole?: boolean;
};

export type DepartmentWithPositions = Department & { positions: DepartmentPosition[] };

export type WorkShift = { id: string; name: string; startTime: string; endTime: string; breakMinutes: number };

export type ShiftAssignment = {
  id: string;
  personnelId: string;
  shiftId: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  shift?: WorkShift;
};

export type ShiftRosterEmployee = {
  rosterId: string;
  personnelId: string;
  fullName: string;
};

export type ShiftRosterSlot = {
  slotId: string;
  label: string;
  startTime: string;
  endTime: string;
  employees: ShiftRosterEmployee[];
};

export type ShiftRosterDay = {
  date: string;
  dayLabel: string;
  isDayOff: boolean;
  holidayTitle?: string;
  shiftCount: number;
  shifts: ShiftRosterSlot[];
};

export type ShiftRosterPersonDay = {
  date: string;
  dayLabel: string;
  isDayOff: boolean;
  assignment: {
    rosterId: string;
    slotLabel: string;
    startTime: string;
    endTime: string;
  } | null;
};

export type ShiftRosterPerson = {
  personnelId: string;
  fullName: string;
  days: ShiftRosterPersonDay[];
};

export type ShiftRosterWeek = {
  weekStart: string;
  weekEnd: string;
  days: ShiftRosterDay[];
  byPerson: ShiftRosterPerson[];
};

export type AttendanceRecord = {
  id: string;
  personnelId: string;
  workDate: string;
  checkInAt?: string;
  checkOutAt?: string;
  lateMinutes: number;
  overtimeMinutes: number;
  workedMinutes: number;
  status: string;
  personnel?: Personnel;
};

export type PayrollRecord = {
  id: string;
  personnelId: string;
  periodStart: string;
  periodEnd: string;
  baseAmount: number;
  overtimeAmount: number;
  deductions: number;
  netAmount: number;
  status: string;
  personnel?: Personnel;
};

export type LeaveRequest = {
  id: string;
  personnelId: string;
  type: string;
  fromDate: string;
  toDate: string;
  status: string;
  personnel?: Personnel;
};

export type EmployeeAlert = {
  id: string;
  personnelId?: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
};

export type AttendanceImportPreview = {
  summary: {
    totalRows: number;
    importableCount: number;
    unmatchedCount: number;
    employeeCount: number;
  };
  sample: Array<{
    personnelId: string;
    personnelName: string;
    workDate: string;
    checkInAt?: string;
    checkOutAt?: string;
  }>;
  unmatched: Array<{
    employeeKey: string;
    employeeName?: string;
    workDate: string;
    reason: string;
  }>;
  format?: string;
  sheetName?: string;
  warnings?: string[];
};

export type AttendanceImportResult = AttendanceImportPreview & {
  created: number;
  updated: number;
};

export type EmployeeDetail = {
  employee: Personnel & {
    employeeCode?: string;
    departmentId?: string;
    department?: { id: string; name: string };
    isDriver?: boolean;
    licenseNumber?: string;
    licenseExpiryDate?: string;
  };
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  leaves: LeaveRequest[];
  documents: Array<{ id: string; title: string; documentType: string; expiryDate?: string }>;
  notes: Array<{ id: string; content: string; noteDate: string }>;
  shifts: Array<{ id: string; startDate?: string; endDate?: string; shift?: WorkShift }>;
  alerts: EmployeeAlert[];
  activeVehicleCount: number;
};
