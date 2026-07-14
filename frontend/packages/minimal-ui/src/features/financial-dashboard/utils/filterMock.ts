import { FinancialFilters } from '../types';

export function filterByPlant<T extends { plantId?: string }>(rows: T[], filters: FinancialFilters): T[] {
  if (!filters.plantId) return rows;
  return rows.filter((r) => r.plantId === filters.plantId);
}

export function filterByCustomerId<T extends { customerId?: string }>(rows: T[], filters: FinancialFilters): T[] {
  if (!filters.customerId) return rows;
  return rows.filter((r) => r.customerId === filters.customerId);
}

export function filterBySupplierId<T extends { supplierId?: string }>(rows: T[], filters: FinancialFilters): T[] {
  if (!filters.supplierId) return rows;
  return rows.filter((r) => r.supplierId === filters.supplierId);
}

export function filterByGrade<T extends { grade: string }>(rows: T[], grade?: string): T[] {
  if (!grade) return rows;
  return rows.filter((r) => r.grade === grade);
}

export function filterByEntity<T extends { entityId: string; entityType: string }>(
  rows: T[],
  filters: FinancialFilters,
): T[] {
  let result = rows;
  if (filters.customerId) {
    result = result.filter((r) => r.entityType === 'customer' && r.entityId === filters.customerId);
  }
  if (filters.projectId) {
    result = result.filter((r) => r.entityType === 'project' && r.entityId === filters.projectId);
  }
  return result;
}

export function filterByPaymentStatus<T extends { paymentStatus?: string; overdue?: number }>(
  rows: T[],
  status?: string,
): T[] {
  if (!status) return rows;
  if (status === 'overdue') {
    return rows.filter((r) => r.paymentStatus === 'معوق' || (r.overdue != null && r.overdue > 0));
  }
  if (status === 'partial') {
    return rows.filter((r) => r.paymentStatus === 'جاری' || r.paymentStatus === 'ناقص');
  }
  if (status === 'paid') {
    return rows.filter((r) => r.paymentStatus === 'خوب' || r.paymentStatus === 'تسویه‌شده');
  }
  return rows;
}

export function filterByFleetId<T extends { vehicleId?: string }>(rows: T[], fleetId?: string): T[] {
  if (!fleetId) return rows;
  return rows.filter((r) => r.vehicleId === fleetId);
}

/** Scales monetary KPIs when a single plant is selected (mock approximation). */
export function plantScopeFactor(filters: FinancialFilters, plantCount: number): number {
  if (!filters.plantId || plantCount <= 0) return 1;
  return 1 / plantCount;
}
