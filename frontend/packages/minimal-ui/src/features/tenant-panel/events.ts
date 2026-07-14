export const TENANT_COMPANY_PROFILE_UPDATED = 'tenant-company-profile-updated';

export function notifyTenantCompanyProfileUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TENANT_COMPANY_PROFILE_UPDATED));
}
