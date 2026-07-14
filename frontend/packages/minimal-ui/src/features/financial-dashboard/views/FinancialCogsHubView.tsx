'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { FinancialHubShell } from '../components/FinancialHubShell';
import { FinancialPageView } from '../components/FinancialPageView';
import { FinancialCompanyExpensesView } from './FinancialCompanyExpensesView';
import { FinancialMaterialPurchasesView } from './FinancialMaterialPurchasesView';
import { FINANCIAL_HUB_BY_ID } from '../constants/hubs';

type Props = { isDark: boolean };

export function FinancialCogsHubView({ isDark }: Props) {
  const hub = FINANCIAL_HUB_BY_ID.cogs;

  return (
    <FinancialHubShell
      hub={hub}
      isDark={isDark}
      renderTab={(tabId) => {
        if (tabId === 'material-purchases') {
          return <FinancialMaterialPurchasesView isDark={isDark} />;
        }
        if (tabId === 'company-expenses') {
          return <FinancialCompanyExpensesView isDark={isDark} />;
        }
        const tab = hub.tabs.find((t) => t.id === tabId);
        if (tab?.pageId) {
          return <FinancialPageView pageId={tab.pageId} isDark={isDark} variant="hub" />;
        }
        return null;
      }}
    />
  );
}
