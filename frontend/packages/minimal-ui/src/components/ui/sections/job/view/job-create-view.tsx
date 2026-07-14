'use client';

import { paths } from '@/ui/routes/paths';

import { DashboardContent } from '@/ui/layouts/dashboard';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';

import { JobCreateEditForm } from '../job-create-edit-form';

// ----------------------------------------------------------------------

export function JobCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new job"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Job', href: paths.dashboard.job.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <JobCreateEditForm />
    </DashboardContent>
  );
}
