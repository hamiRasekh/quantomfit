'use client';

import type { IProductItem } from '@/types/product';

import { paths } from '@/ui/routes/paths';

import { DashboardContent } from '@/ui/layouts/dashboard';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';

import { ProductCreateEditForm } from '../product-create-edit-form';

// ----------------------------------------------------------------------

type Props = {
  product?: IProductItem;
};

export function ProductEditView({ product }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.product.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Product', href: paths.dashboard.product.root },
          { name: product?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ProductCreateEditForm currentProduct={product} />
    </DashboardContent>
  );
}
