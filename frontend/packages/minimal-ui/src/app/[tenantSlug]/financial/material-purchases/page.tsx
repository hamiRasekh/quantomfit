'use client';

import FinancialMaterialPurchasesPage from '@/app/_tenant-pages/financial/material-purchases/page';
import TenantShell from '@/app/_tenant-pages/_components/TenantShell';

export default function TenantFinancialMaterialPurchasesPage() {
  return (
    <TenantShell>
      <FinancialMaterialPurchasesPage />
    </TenantShell>
  );
}
