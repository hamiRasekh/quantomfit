'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { ordersSalesApi } from '../api/ordersSalesApi';
import {
  ORDER_WORKFLOW_STEPS,
  OrderWorkflowStage,
  nextWorkflowStage,
  resolveWorkflowStage,
  workflowStageIndex,
} from '../constants/order-workflow';
import { Order, OrderStatus, ORDER_STATUS_OPTIONS } from '../types';
import { OrderSalesStatusBadge } from './OrderSalesStatusBadge';

const ORANGE = '#EA580C';

type Props = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSaved: () => void;
};

export function OrderWorkflowDialog({ open, order, onClose, onSaved }: Props) {
  const basePath = useTenantBasePath();
  const [selectedStage, setSelectedStage] = useState<OrderWorkflowStage>(OrderWorkflowStage.REGISTERED);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(OrderStatus.DRAFT);
  const [cancelReason, setCancelReason] = useState('');
  const [saving, setSaving] = useState(false);

  const activeStep = useMemo(() => workflowStageIndex(selectedStage), [selectedStage]);
  const currentStep = ORDER_WORKFLOW_STEPS[activeStep];
  const nextStage = nextWorkflowStage(selectedStage);

  useEffect(() => {
    if (!order) return;
    setSelectedStage(resolveWorkflowStage(order.workflowStage));
    setSelectedStatus(order.status);
    setCancelReason(order.cancelReason ?? '');
  }, [order]);

  const handleSave = async (stageOverride?: OrderWorkflowStage) => {
    if (!order) return;
    const workflowStage = stageOverride ?? selectedStage;

    if (selectedStatus === OrderStatus.CANCELLED && !cancelReason.trim()) {
      toast.error('برای لغو سفارش، ذکر دلیل الزامی است');
      return;
    }

    setSaving(true);
    try {
      await ordersSalesApi.updateFields(order.id, {
        workflowStage,
        status: selectedStatus,
        cancelReason: selectedStatus === OrderStatus.CANCELLED ? cancelReason.trim() : undefined,
      });
      toast.success('فرآیند و وضعیت سفارش به‌روزرسانی شد');
      onSaved();
      onClose();
    } catch {
      toast.error('خطا در به‌روزرسانی سفارش');
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: `${ORANGE}18`,
              color: ORANGE,
            }}
          >
            <Iconify icon="solar:restart-bold" width={22} />
          </Box>
          <Stack spacing={0.25}>
            <Typography sx={{ fontWeight: 900 }}>فرآیند سفارش {order.orderNumber}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <OrderSalesStatusBadge status={order.status} />
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {order.title || order.customerName || '—'}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 1.5 }}>مراحل فرآیند</Typography>
            <Stepper activeStep={activeStep} alternativeLabel nonLinear>
              {ORDER_WORKFLOW_STEPS.map((step) => (
                <Step key={step.id}>
                  <StepButton color="inherit" onClick={() => setSelectedStage(step.id)}>
                    {step.shortLabel}
                  </StepButton>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: `${ORANGE}44`,
              bgcolor: `${ORANGE}08`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Iconify icon={currentStep.icon} width={28} sx={{ color: ORANGE, mt: 0.25 }} />
              <Stack spacing={0.75} sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800 }}>{currentStep.label}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{currentStep.description}</Typography>
                {currentStep.toolHref && (
                  <Button
                    component={Link}
                    href={buildTenantHref(
                      basePath,
                      currentStep.id === OrderWorkflowStage.MIX_DESIGN
                        ? `/concrete-mix/builder?orderId=${order.id}`
                        : currentStep.toolHref,
                    )}
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="solar:double-alt-arrow-right-bold-duotone" width={16} />}
                    sx={{ alignSelf: 'flex-start', mt: 0.5, borderColor: ORANGE, color: ORANGE }}
                  >
                    {currentStep.toolLabel}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {nextStage && (
              <Button
                variant="contained"
                disabled={saving}
                onClick={() => handleSave(nextStage)}
                startIcon={<Iconify icon="solar:double-alt-arrow-right-bold-duotone" width={18} />}
                sx={{ bgcolor: ORANGE, '&:hover': { bgcolor: '#C2410C' } }}
              >
                ارسال به مرحله بعد: {ORDER_WORKFLOW_STEPS.find((s) => s.id === nextStage)?.label}
              </Button>
            )}
            <Button variant="outlined" disabled={saving} onClick={() => handleSave()}>
              ذخیره مرحله انتخاب‌شده
            </Button>
          </Stack>

          <Divider />

          <Box>
            <Typography sx={{ fontWeight: 800, mb: 1.5 }}>وضعیت عملیاتی سفارش</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {ORDER_STATUS_OPTIONS.map((opt) => {
                const selected = selectedStatus === opt.value;
                return (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    clickable
                    color={selected ? 'warning' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    onClick={() => setSelectedStatus(opt.value)}
                    sx={selected ? { bgcolor: ORANGE, color: '#fff' } : undefined}
                  />
                );
              })}
            </Stack>
          </Box>

          {selectedStatus === OrderStatus.CANCELLED && (
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="دلیل لغو"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          بستن
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() => handleSave()}
          sx={{ bgcolor: ORANGE, '&:hover': { bgcolor: '#C2410C' } }}
        >
          {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
