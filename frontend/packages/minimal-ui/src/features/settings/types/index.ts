export interface BatchingMixer {
  id: string;
  name: string;
  volumeM3: number;
}

export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl?: string;
  nationalId?: string;
  registrationNumber?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAddress?: string | null;
  batchingMixers?: BatchingMixer[];
  phone?: string;
  email?: string;
  defaultLanguage?: string;
  dateFormat?: string;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export type FinancialCurrencyUnit = 'IRR' | 'IRT' | 'USD';
export type ThemeAccent = 'industrial' | 'amber' | 'blue' | 'gray' | 'orange' | 'green' | 'red';

export interface SystemSettings {
  id: string;
  enableNotifications: boolean;
  enableWorkCalendarValidation: boolean;
  defaultPaginationSize: number;
  defaultWageCalculationMode?: string;
  overheadCalculationMode?: string;
  maintenanceMode: boolean;
  readOnlyMode: boolean;
  financialCurrencyUnit: FinancialCurrencyUnit;
  themeAccent: ThemeAccent;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyProfileDto {
  name?: string;
  logoUrl?: string;
  nationalId?: string;
  registrationNumber?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAddress?: string | null;
  batchingMixers?: BatchingMixer[];
  phone?: string;
  email?: string;
  defaultLanguage?: string;
  dateFormat?: string;
  currency?: string;
}

export interface UpdateSystemSettingsDto {
  enableNotifications?: boolean;
  enableWorkCalendarValidation?: boolean;
  defaultPaginationSize?: number;
  defaultWageCalculationMode?: string;
  overheadCalculationMode?: string;
  maintenanceMode?: boolean;
  readOnlyMode?: boolean;
  financialCurrencyUnit?: FinancialCurrencyUnit;
  themeAccent?: ThemeAccent;
}

export interface AdminTenantCompany {
  id: string;
  name: string;
  slug: string;
  status: string;
  planId: string | null;
  createdAt: string;
  tenantDb: string | null;
}

export interface AdminTenantCompanyDetails extends AdminTenantCompany {
  updatedAt: string;
  loginUrl: string;
  adminEmail: string | null;
  adminPassword: string | null;
  passwordAvailable: boolean;
}

export interface CreateTenantCompanyDto {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  planCode?: string;
  moduleCodes?: string[];
}

export interface UpdateTenantCompanyAdminCredentialsDto {
  adminEmail?: string;
  newPassword?: string;
}

export interface MasterUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
  roles: string[];
}

export interface MasterRole {
  id: string;
  name: string;
  code: string;
  isSystem: boolean;
  permissions: string[];
}

export interface MasterPermission {
  id: string;
  code: string;
  name: string;
}




