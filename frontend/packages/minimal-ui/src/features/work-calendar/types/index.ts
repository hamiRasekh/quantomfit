export interface WorkShiftTemplate {
  id: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  label?: string;
  isActive?: boolean;
}

export interface WorkDayShift {
  id: string;
  startTime: string;
  endTime: string;
  label?: string;
  isActive?: boolean;
}

export interface WorkCalendarSettings {
  id: string;
  isValidationEnabled: boolean;
  workStartTime?: string;
  workEndTime?: string;
  weekStartDay?: number;
  weeklyTemplate: WorkShiftTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkDay {
  id: string;
  date: string;
  title: string;
  isHoliday: boolean;
  isFullDayOff: boolean;
  shifts?: WorkDayShift[];
  note?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface UpdateWorkCalendarSettingsDto {
  isValidationEnabled?: boolean;
  workStartTime?: string;
  workEndTime?: string;
  weekStartDay?: number;
  weeklyTemplate?: WorkShiftTemplate[];
}

export interface CreateHolidayDto {
  date: string;
  title: string;
  isFullDayOff?: boolean;
  isHoliday?: boolean;
  shifts?: WorkDayShift[];
  note?: string;
}

export interface UpdateHolidayDto extends Partial<CreateHolidayDto> {}

export interface WorkCalendarListParams {
  page?: number;
  limit?: number;
}

