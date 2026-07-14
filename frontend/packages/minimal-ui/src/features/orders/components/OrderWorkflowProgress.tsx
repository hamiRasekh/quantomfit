'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import {
  ORDER_WORKFLOW_STEPS,
  OrderWorkflowStage,
  resolveWorkflowStage,
  workflowStageIndex,
} from '../constants/order-workflow';

const ORANGE = '#EA580C';

type Props = {
  stage?: OrderWorkflowStage | null;
  compact?: boolean;
};

export function OrderWorkflowProgress({ stage, compact }: Props) {
  const resolved = resolveWorkflowStage(stage);
  const activeIndex = workflowStageIndex(resolved);

  return (
    <Stack spacing={compact ? 0.5 : 1}>
      {!compact && (
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
          مسیر فرآیند: {ORDER_WORKFLOW_STEPS[activeIndex]?.label}
        </Typography>
      )}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {ORDER_WORKFLOW_STEPS.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          const color = done || active ? ORANGE : 'action.disabled';

          return (
            <Stack key={step.id} direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
              <Tooltip title={step.label}>
                <Box
                  sx={{
                    width: compact ? 28 : 34,
                    height: compact ? 28 : 34,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: active ? `${ORANGE}22` : done ? `${ORANGE}14` : 'action.hover',
                    border: '2px solid',
                    borderColor: active ? ORANGE : done ? `${ORANGE}88` : 'divider',
                    color,
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={step.icon} width={compact ? 14 : 16} />
                </Box>
              </Tooltip>
              {index < ORDER_WORKFLOW_STEPS.length - 1 && (
                <Box
                  sx={{
                    width: compact ? 12 : 18,
                    height: 2,
                    borderRadius: 1,
                    bgcolor: index < activeIndex ? ORANGE : 'divider',
                    flexShrink: 0,
                  }}
                />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
