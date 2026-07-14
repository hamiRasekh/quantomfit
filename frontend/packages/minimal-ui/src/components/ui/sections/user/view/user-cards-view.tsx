'use client';

import Button from '@mui/material/Button';

import { paths } from '@/ui/routes/paths';
import { RouterLink } from '@/ui/routes/components';

import { _userCards } from '@/ui/_mock';
import { Iconify } from '@/components/ui/iconify';
import { DashboardContent } from '@/ui/layouts/dashboard';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';

import { UserCardList } from '../user-card-list';

// ----------------------------------------------------------------------

export function UserCardsView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Cards"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.user.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add user
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserCardList users={_userCards} />
    </DashboardContent>
  );
}
