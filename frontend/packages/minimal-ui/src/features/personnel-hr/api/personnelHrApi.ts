import { apiClient } from '@/shared/api/client';
import { ApiResponse, PaginationResponse } from '@/shared/api/types';
import { Personnel } from '@/features/personnel/types';
import { personnelApi } from '@/features/personnel/api/personnelApi';
import {
  AttendanceRecord,
  Department,
  DepartmentPosition,
  DepartmentWithPositions,
  AttendanceImportPreview,
  AttendanceImportResult,
  EmployeeAlert,
  EmployeeDetail,
  HrDashboard,
  HrSummaryReport,
  LeaveRequest,
  PayrollRecord,
  ShiftAssignment,
  ShiftRosterWeek,
  WorkShift,
} from '../types';

const BASE = '/personnel';

export const personnelHrApi = {
  getDashboard: async (): Promise<HrDashboard> => {
    const res = await apiClient.get<ApiResponse<HrDashboard>>(`${BASE}/dashboard`);
    return res.data.data;
  },

  listAlerts: async (): Promise<EmployeeAlert[]> => {
    const res = await apiClient.get<ApiResponse<EmployeeAlert[]>>(`${BASE}/alerts`);
    return res.data.data;
  },

  listDrivers: async (): Promise<Personnel[]> => {
    const res = await apiClient.get<ApiResponse<Personnel[]>>(`${BASE}/drivers`);
    return res.data.data;
  },

  getDetail: async (id: string): Promise<EmployeeDetail> => {
    const res = await apiClient.get<ApiResponse<EmployeeDetail>>(`${BASE}/hr/${id}/detail`);
    return res.data.data;
  },

  createEmployee: async (dto: Record<string, unknown>): Promise<Personnel> => {
    const res = await apiClient.post<ApiResponse<Personnel>>(`${BASE}/hr/employees`, dto);
    return res.data.data;
  },

  updateEmployee: async (id: string, dto: Record<string, unknown>): Promise<Personnel> => {
    const res = await apiClient.patch<ApiResponse<Personnel>>(`${BASE}/hr/${id}`, dto);
    return res.data.data;
  },

  listDepartments: async (): Promise<DepartmentWithPositions[]> => {
    const res = await apiClient.get<ApiResponse<DepartmentWithPositions[]>>(`${BASE}/departments/list`);
    return res.data.data;
  },

  createDepartment: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<Department>>(`${BASE}/departments`, dto);
    return res.data.data;
  },

  createDepartmentPosition: async (dto: {
    departmentId: string;
    name: string;
    code?: string;
    isDriverRole?: boolean;
  }): Promise<DepartmentPosition> => {
    const res = await apiClient.post<ApiResponse<DepartmentPosition>>(`${BASE}/departments/positions`, dto);
    return res.data.data;
  },

  listShifts: async (): Promise<WorkShift[]> => {
    const res = await apiClient.get<ApiResponse<WorkShift[]>>(`${BASE}/shifts/list`);
    return res.data.data;
  },

  createShift: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<WorkShift>>(`${BASE}/shifts`, dto);
    return res.data.data;
  },

  listAttendance: async (params?: {
    personnelId?: string;
    from?: string;
    to?: string;
  }): Promise<AttendanceRecord[]> => {
    const search = new URLSearchParams();
    if (params?.personnelId) search.set('personnelId', params.personnelId);
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    const q = search.toString() ? `?${search.toString()}` : '';
    const res = await apiClient.get<ApiResponse<AttendanceRecord[]>>(`${BASE}/attendance/list${q}`);
    return res.data.data;
  },

  listShiftAssignments: async (
    personnelId: string,
    from?: string,
    to?: string,
  ): Promise<ShiftAssignment[]> => {
    const search = new URLSearchParams({ personnelId });
    if (from) search.set('from', from);
    if (to) search.set('to', to);
    const res = await apiClient.get<ApiResponse<ShiftAssignment[]>>(
      `${BASE}/shift-assignments/list?${search.toString()}`,
    );
    return res.data.data;
  },

  assignWeekShift: async (dto: { personnelId: string; shiftId: string; weekStart: string }) => {
    const res = await apiClient.post<ApiResponse<ShiftAssignment>>(`${BASE}/shift-assignments/week`, dto);
    return res.data.data;
  },

  getShiftRosterWeek: async (weekStart: string): Promise<ShiftRosterWeek> => {
    const res = await apiClient.get<ApiResponse<ShiftRosterWeek>>(
      `${BASE}/shift-roster/week?weekStart=${encodeURIComponent(weekStart)}`,
    );
    return res.data.data;
  },

  assignShiftRoster: async (dto: {
    personnelId: string;
    workDate: string;
    slotId: string;
    slotLabel?: string;
    startTime: string;
    endTime: string;
  }) => {
    const res = await apiClient.post<ApiResponse<unknown>>(`${BASE}/shift-roster`, dto);
    return res.data.data;
  },

  unassignShiftRoster: async (rosterId: string) => {
    await apiClient.delete(`${BASE}/shift-roster/${rosterId}`);
  },

  createAttendance: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<AttendanceRecord>>(`${BASE}/attendance`, dto);
    return res.data.data;
  },

  previewAttendanceImport: async (file: File): Promise<AttendanceImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<AttendanceImportPreview>>(
      `${BASE}/attendance/import/preview`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  },

  importAttendanceExcel: async (file: File): Promise<AttendanceImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<AttendanceImportResult>>(
      `${BASE}/attendance/import`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.data;
  },

  listPayroll: async (personnelId?: string): Promise<PayrollRecord[]> => {
    const q = personnelId ? `?personnelId=${personnelId}` : '';
    const res = await apiClient.get<ApiResponse<PayrollRecord[]>>(`${BASE}/payroll/list${q}`);
    return res.data.data;
  },

  createPayroll: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<PayrollRecord>>(`${BASE}/payroll`, dto);
    return res.data.data;
  },

  listLeaves: async (personnelId?: string): Promise<LeaveRequest[]> => {
    const q = personnelId ? `?personnelId=${personnelId}` : '';
    const res = await apiClient.get<ApiResponse<LeaveRequest[]>>(`${BASE}/leaves/list${q}`);
    return res.data.data;
  },

  createLeave: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<LeaveRequest>>(`${BASE}/leaves`, dto);
    return res.data.data;
  },

  createDocument: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<unknown>>(`${BASE}/documents`, dto);
    return res.data.data;
  },

  createShiftAssignment: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<unknown>>(`${BASE}/shift-assignments`, dto);
    return res.data.data;
  },

  reports: async (): Promise<HrSummaryReport> => {
    const res = await apiClient.get<ApiResponse<HrSummaryReport>>(`${BASE}/reports/summary`);
    return res.data.data;
  },

  listAll: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
    personnelApi.getAll(params),
};
