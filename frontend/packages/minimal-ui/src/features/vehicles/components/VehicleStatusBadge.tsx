'use client';

import Chip from '@mui/material/Chip';
import { VehicleStatus } from '../types';
import { VEHICLE_STATUS_LABELS, vehicleStatusColor } from '../utils/labels';

type Props = { status: VehicleStatus; size?: 'small' | 'medium' };

export function VehicleStatusBadge({ status, size = 'small' }: Props) {
  const color = vehicleStatusColor(status);
  return (
    <Chip
      size={size}
      label={VEHICLE_STATUS_LABELS[status] ?? status}
      color={color === 'default' ? 'default' : color}
      variant={color === 'default' ? 'outlined' : 'filled'}
    />
  );
}
