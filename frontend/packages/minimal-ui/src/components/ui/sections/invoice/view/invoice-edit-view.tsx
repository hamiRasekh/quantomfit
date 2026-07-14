'use client';

import type { IInvoice } from '@/types/invoice';

import { paths } from '@/ui/routes/paths';

import { DashboardContent } from '@/ui/layouts/dashboard';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';

import { InvoiceCreateEditForm } from '../invoice-create-edit-form';

// ----------------------------------------------------------------------

type Props = {
  invoice?: IInvoice;
};

export function InvoiceEditView({ invoice }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.invoice.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Invoice', href: paths.dashboard.invoice.root },
          { name: invoice?.invoiceNumber },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceCreateEditForm currentInvoice={invoice} />
    </DashboardContent>
  );
}
