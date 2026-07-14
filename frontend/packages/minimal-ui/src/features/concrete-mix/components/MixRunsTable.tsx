'use client';

import { useRouter } from 'next/navigation';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { MIX_MODULE_LABELS, MIX_STATUS_LABELS } from '../constants';

function formatRunDate(value: string) {
  try {
    return new Date(value).toLocaleString('fa-IR');
  } catch {
    return value;
  }
}
import { ConcreteCalculationRun } from '../types';

type Props = {
  runs: ConcreteCalculationRun[];
  isDark: boolean;
  accent: string;
  detailHref: (id: string) => string;
};

export function MixRunsTable({ runs, isDark, accent, detailHref }: Props) {
  const router = useRouter();
  const headColor = isDark ? 'rgba(234,242,255,0.75)' : 'rgba(4,4,74,0.65)';
  const text = isDark ? '#EAF2FF' : '#04044A';

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
        bgcolor: isDark ? 'rgba(15,23,42,0.45)' : '#fff',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {['زمان', 'بخش', 'وضعیت', 'مقاومت', 'اسلامپ', 'ظرفیت بچ', 'نتیجه', ''].map((h) => (
              <TableCell key={h} sx={{ fontWeight: 800, color: headColor }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {runs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography sx={{ py: 3, textAlign: 'center', color: headColor }}>رکوردی ثبت نشده است.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            runs.map((run) => {
              const output = run.outputPayload || {};
              const perM3 = (output as { perM3?: { cementKg?: number } }).perM3;
              const cement = perM3?.cementKg != null ? Number(perM3.cementKg).toFixed(1) : null;
              const summary =
                run.sourceModule === 'predictor'
                  ? `${output.predictedStrengthMpa ?? '—'} MPa`
                  : cement
                    ? `${cement} kg سیمان/m³`
                    : '—';

              return (
                <TableRow key={run.id} hover>
                  <TableCell sx={{ color: text, whiteSpace: 'nowrap' }}>
                    {formatRunDate(run.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={MIX_MODULE_LABELS[run.sourceModule] || run.sourceModule}
                      sx={{ bgcolor: `${accent}18`, color: accent, fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={MIX_STATUS_LABELS[run.status] || run.status}
                      color={run.status === 'completed' ? 'success' : run.status === 'failed' ? 'error' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ color: text }}>{run.requestedStrengthMpa || '—'}</TableCell>
                  <TableCell sx={{ color: text }}>{run.requestedSlumpMm || '—'}</TableCell>
                  <TableCell sx={{ color: text }}>{run.requestedVolumeM3}</TableCell>
                  <TableCell sx={{ color: text, maxWidth: 180 }}>{summary}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push(detailHref(run.id))}
                      endIcon={<Iconify icon="solar:eye-bold" width={16} />}
                      sx={{ borderColor: `${accent}66`, color: accent, fontWeight: 700 }}
                    >
                      نمایش بیشتر
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
