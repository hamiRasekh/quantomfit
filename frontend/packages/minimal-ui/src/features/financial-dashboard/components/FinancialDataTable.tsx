'use client';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { FinancialTableColumn, FinancialTableRow } from '../types';

type Props = {
  title: string;
  columns: FinancialTableColumn[];
  rows: FinancialTableRow[];
  isDark: boolean;
};

export function FinancialDataTable({ title, columns, rows, isDark }: Props) {
  const headColor = isDark ? 'rgba(234,242,255,0.75)' : 'rgba(4,4,74,0.65)';
  const text = isDark ? '#EAF2FF' : '#04044A';

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Typography sx={{ px: 2, pt: 2, pb: 1, fontWeight: 900, fontSize: 15, color: text }}>{title}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'right'} sx={{ fontWeight: 800, color: headColor }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: headColor }}>
                  داده‌ای برای نمایش وجود ندارد
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={idx} hover>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || 'right'} sx={{ color: text }}>
                      {row[col.id] ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
