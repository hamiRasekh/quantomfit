import { VehicleStatus, VehicleTripStatus, VehicleType } from '../types';

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  MIXER_TRUCK: 'تراک میکسر',
  PUMP_TRUCK: 'پمپ بتن',
  MATERIAL_TRUCK: 'کامیون مصالح',
  SERVICE: 'خودروی خدماتی',
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  READY: 'آماده',
  IN_MISSION: 'در مأموریت',
  LOADING: 'در حال بارگیری',
  IN_TRANSIT: 'در مسیر',
  UNLOADING: 'در حال تخلیه',
  RETURNING: 'در حال برگشت',
  IN_SERVICE: 'در سرویس',
  BROKEN: 'خراب',
  INACTIVE: 'غیرفعال',
};

export const TRIP_STATUS_LABELS: Record<VehicleTripStatus, string> = {
  SCHEDULED: 'برنامه‌ریزی‌شده',
  LOADING: 'در حال بارگیری',
  DEPARTED: 'خارج شده',
  IN_TRANSIT: 'در مسیر',
  ARRIVED: 'رسیده',
  UNLOADING: 'در حال تخلیه',
  COMPLETED: 'تکمیل‌شده',
  CANCELLED: 'لغوشده',
  DELAYED: 'تأخیر',
};

export function vehicleStatusColor(status: VehicleStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'READY':
      return 'success';
    case 'BROKEN':
    case 'INACTIVE':
      return 'error';
    case 'IN_SERVICE':
      return 'warning';
    case 'IN_TRANSIT':
    case 'IN_MISSION':
    case 'LOADING':
    case 'UNLOADING':
      return 'info';
    default:
      return 'default';
  }
}
