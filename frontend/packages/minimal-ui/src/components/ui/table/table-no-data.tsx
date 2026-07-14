'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { EmptyContent } from '../empty-content';

// ----------------------------------------------------------------------

export type TableNoDataProps = {
  notFound: boolean;
  sx?: SxProps<Theme>;
  colSpan?: number;
};

export function TableNoData({ notFound, colSpan = 9, sx }: TableNoDataProps) {
  if (!notFound) {
    return null;
  }

  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 10 }}>
        <EmptyContent filled sx={[{ py: 0 }, ...(Array.isArray(sx) ? sx : [sx])]} />
      </TableCell>
    </TableRow>
  );
}
