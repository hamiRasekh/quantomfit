'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

import { concreteMixApi } from '../api/concreteMixApi';
import { MixOutputVisualization } from '../components/MixOutputVisualization';
import { MIX_MODULE_LABELS, MIX_STATUS_LABELS } from '../constants';
import { ConcreteCalculationRun } from '../types';

type Props = { runId: string };

export function MixRunDetailView({ runId }: Props) {
  const { isDark, colors } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [run, setRun] = useState<ConcreteCalculationRun | null>(null);
  const [trace, setTrace] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [runData, traceData] = await Promise.all([
          concreteMixApi.getRun(runId),
          concreteMixApi.getRunTrace(runId),
        ]);
        if (!active) return;
        setRun(runData);
        setTrace(traceData);
      } catch (e: unknown) {
        if (active) setError(e instanceof Error ? e.message : 'بارگذاری ناموفق');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [runId]);

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error || !run) {
    return <Alert severity="error">{error || 'رکورد یافت نشد'}</Alert>;
  }

  const output = (run.outputPayload || {}) as Record<string, unknown>;
  const perM3 = (output.perM3 || output.optimizedPerM3) as Record<string, number> | undefined;
  const batch = output.batch as Record<string, number> | undefined;
  const formulas = ((trace?.trace as Record<string, unknown>)?.formulas ||
    (run.tracePayload as { formulas?: unknown[] })?.formulas ||
    []) as Array<Record<string, unknown>>;

  const text = isDark ? '#EAF2FF' : '#04044A';

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader title="جزئیات اجرای طرح اختلاط" isDark={isDark} />
      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Chip label={MIX_MODULE_LABELS[run.sourceModule]} sx={{ bgcolor: `${colors.primary}22`, color: colors.primary }} />
        <Chip label={MIX_STATUS_LABELS[run.status] || run.status} variant="outlined" />
        {run.baseMix?.code ? <Chip label={`مخلوط: ${run.baseMix.code}`} variant="outlined" /> : null}
        {run.formulaVersionTag ? <Chip label={`فرمول: ${run.formulaVersionTag}`} variant="outlined" /> : null}
      </Stack>

      {run.sourceModule === 'predictor' ? (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800, color: text }}>پیش‌بینی</Typography>
          <Typography sx={{ mt: 1, color: text }}>
            مقاومت: {String(output.predictedStrengthMpa)} MPa — اسلامپ: {String(output.predictedSlumpMm)} cm — اطمینان:{' '}
            {String(output.confidencePercent)}%
          </Typography>
        </Paper>
      ) : perM3 ? (
        <MixOutputVisualization perM3={perM3} batch={batch} isDark={isDark} accent={colors.primary} />
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 800, mb: 1, color: text }}>ورودی‌ها</Typography>
            <pre style={{ margin: 0, fontSize: 12, overflow: 'auto', direction: 'ltr' }}>
              {JSON.stringify(run.inputPayload, null, 2)}
            </pre>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 800, mb: 1, color: text }}>خروجی کامل</Typography>
            <pre style={{ margin: 0, fontSize: 12, overflow: 'auto', direction: 'ltr' }}>
              {JSON.stringify(run.outputPayload, null, 2)}
            </pre>
          </Paper>
        </Grid>
      </Grid>

      {formulas.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['فرمول', 'متغیر', 'نتیجه', 'ترتیب'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 800 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {formulas.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{String(row.formulaName || row.formulaCode || '—')}</TableCell>
                  <TableCell>{String(row.resultVariable || '—')}</TableCell>
                  <TableCell>{String(row.result ?? '—')}</TableCell>
                  <TableCell>{String(row.executionOrder ?? '—')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      {run.errorMessage ? <Alert severity="error">{run.errorMessage}</Alert> : null}
    </Stack>
  );
}
