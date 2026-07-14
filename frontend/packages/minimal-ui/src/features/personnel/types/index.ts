export enum SalaryType {
  MONTHLY = 'MONTHLY',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  PIECE_RATE = 'PIECE_RATE', // بر اساس هر محصول
}

export interface Personnel {
    id: string;
    employeeCode?: string;
    departmentId?: string;
    department?: { id: string; name: string };
    isDriver?: boolean;
    licenseNumber?: string;
    licenseExpiryDate?: string;
    employmentType?: string;
    userId?: string;
    firstName: string;
  lastName: string;
  nationalId?: string;
  mobile: string;
  startDate?: string;
  isActive: boolean;
  positionId?: string;
  position?: {
    id: string;
    name: string;
  };
  salaryType: SalaryType;
  baseSalary: number;
  overtimeMultiplier: number;
  processes?: {
    id: string;
    name: string;
    code?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  lastLoginAt?: string;
}

export interface CreatePersonnelDto {
  firstName: string;
  lastName: string;
  nationalId?: string;
  mobile: string;
  startDate?: string;
  isActive?: boolean;
  positionId?: string;
  salaryType?: SalaryType;
  baseSalary?: number;
  overtimeMultiplier?: number;
  processIds?: string[];
  loginPassword?: string;
}

export interface UpdatePersonnelDto {
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  mobile?: string;
  startDate?: string;
  isActive?: boolean;
  positionId?: string;
  salaryType?: SalaryType;
  baseSalary?: number;
  overtimeMultiplier?: number;
  processIds?: string[];
  loginPassword?: string;
}

export interface PersonnelListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  positionId?: string;
}

export interface PersonnelFilters {
  search: string;
  isActive: 'all' | boolean;
  positionId: string;
}

