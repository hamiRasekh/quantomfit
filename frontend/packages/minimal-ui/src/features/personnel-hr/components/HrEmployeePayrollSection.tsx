'use client';

import { useCallback, useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { personnelHrApi } from '../api/personnelHrApi';
import { PayrollRecord } from '../types';
import { displayDate, displayMoney, labelPayrollStatus } from '../utils/display';
import { PayrollForm } from './HrDetailForms';

type Props = {
  personnelId: string;
  panelSx: object;
  text: string;
  muted: string;
  isDark: boolean;
  onChanged: () => void;
};

export function HrEmployeePayrollSection({
  personnelId,
  panelSx,
  text,
  muted,
  isDark,
  onChanged,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PayrollRecord[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    personnelHrApi
      .listPayroll(personnelId)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [personnelId]);

  useEffect(() => {
    load();
  }, [load]);

  const onError = (e: unknown) => {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
    toast.error(msg || 'خطا در ثبت');
  };

  const headSx = {
    color: isDark ? '#D7E7FF' : '#04044A',
    fontWeight: 800,
    bgcolor: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(4,4,74,0.04)',
    borderBottom: isDark ? '1px solid rgba(140,174,246,0.22)' : undefined,
  };

  const cellSx = {
    color: isDark ? '#F2F7FF' : 'inherit',
    borderBottom: isDark ? '1px solid rgba(140,174,246,0.15)' : undefined,
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 900, color: text }}>حقوق و دستمزد</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen((v) => !v)}
        >
          {addOpen ? 'بستن' : 'ثبت حقوق'}
        </Button>
      </Stack>

      <Collapse in={addOpen}>
        <Card sx={{ ...panelSx, p: 2 }}>
          <PayrollForm
            personnelId={personnelId}
            onSaved={() => {
              setAddOpen(false);
              onChanged();
              load();
              toast.success('حقوق ثبت شد');
            }}
            onError={onError}
          />
        </Card>
      </Collapse>

      <Card sx={{ ...panelSx, p: 0, overflow: 'hidden' }}>
        {loading ? (
          <Stack alignItems="center" py={5}>
            <CircularProgress size={28} />
          </Stack>
        ) : rows.length === 0 ? (
          <Typography sx={{ py: 4, textAlign: 'center', color: muted }}>فیش حقوقی ثبت نشده</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>دوره</TableCell>
                  <TableCell sx={headSx}>خالص</TableCell>
                  <TableCell sx={headSx}>پایه</TableCell>
                  <TableCell sx={headSx}>کسورات</TableCell>
                  <TableCell sx={headSx}>وضعیت</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={cellSx}>
                      {displayDate(p.periodStart)} — {displayDate(p.periodEnd)}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, fontWeight: 700 }}>{displayMoney(p.netAmount)}</TableCell>
                    <TableCell sx={cellSx}>{displayMoney(p.baseAmount)}</TableCell>
                    <TableCell sx={cellSx}>{displayMoney(p.deductions)}</TableCell>
                    <TableCell sx={cellSx}>
                      <Chip size="small" label={labelPayrollStatus(p.status)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Stack>
  );
}
