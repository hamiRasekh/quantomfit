'use client';

import { paths } from '@/ui/routes/paths';

import { DashboardContent } from '@/ui/layouts/dashboard';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';

import { TourCreateEditForm } from '../tour-create-edit-form';

// ----------------------------------------------------------------------

export function TourCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new tour"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Tour', href: paths.dashboard.tour.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TourCreateEditForm />
    </DashboardContent>
  );
}
