import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';
import {
  AdminTenantCompany,
  CreateTenantCompanyDto,
  CompanyProfile,
  SystemSettings,
  UpdateCompanyProfileDto,
  UpdateSystemSettingsDto,
} from '../types';

const BASE_URL = '/settings';

export const settingsApi = {
  getCompanyProfile: async (): Promise<CompanyProfile> => {
    const response = await apiClient.get<ApiResponse<CompanyProfile>>(`${BASE_URL}/company`);
    return response.data.data;
  },

  updateCompanyProfile: async (data: UpdateCompanyProfileDto): Promise<CompanyProfile> => {
    const response = await apiClient.patch<ApiResponse<CompanyProfile>>(`${BASE_URL}/company`, data);
    return response.data.data;
  },

  uploadCompanyLogo: async (file: File): Promise<CompanyProfile> => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await apiClient.post<ApiResponse<CompanyProfile>>(`${BASE_URL}/company/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getNeshanMapKey: async (): Promise<{ mapKey: string }> => {
    const response = await apiClient.get<ApiResponse<{ mapKey: string }>>(`${BASE_URL}/neshan/map-key`);
    return response.data.data;
  },

  reverseGeocode: async (lat: number, lng: number): Promise<{ address: string }> => {
    const response = await apiClient.get<ApiResponse<{ address: string }>>(
      `${BASE_URL}/geocoding/reverse?lat=${lat}&lng=${lng}`
    );
    return response.data.data;
  },

  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await apiClient.get<ApiResponse<SystemSettings>>(`${BASE_URL}/system`);
    return response.data.data;
  },

  updateSystemSettings: async (data: UpdateSystemSettingsDto): Promise<SystemSettings> => {
    const response = await apiClient.patch<ApiResponse<SystemSettings>>(`${BASE_URL}/system`, data);
    return response.data.data;
  },

  listTenantCompanies: async (): Promise<AdminTenantCompany[]> => {
    const response = await apiClient.get<ApiResponse<AdminTenantCompany[]>>('/saas/companies');
    return response.data.data;
  },

  createTenantCompany: async (data: CreateTenantCompanyDto): Promise<{ companyId: string; tenantDb: string }> => {
    const response = await apiClient.post<ApiResponse<{ companyId: string; tenantDb: string }>>('/saas/companies', data);
    return response.data.data;
  },
};




