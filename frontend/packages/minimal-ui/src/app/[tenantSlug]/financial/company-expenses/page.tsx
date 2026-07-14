'use client';

import FinancialCompanyExpensesPage from '@/app/_tenant-pages/financial/company-expenses/page';
import TenantShell from '@/app/_tenant-pages/_components/TenantShell';

export default function TenantFinancialCompanyExpensesPage() {
  return (
    <TenantShell>
      <FinancialCompanyExpensesPage />
    </TenantShell>
  );
}
