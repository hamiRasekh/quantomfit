const EPSILON = 1e-9;

export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return fallback;
  if (Math.abs(denominator) < EPSILON) return fallback;
  return numerator / denominator;
}

export function grossProfit(revenue: number, directCosts: number): number {
  return revenue - directCosts;
}

export function grossMarginPercent(revenue: number, directCosts: number): number {
  return safeDivide(grossProfit(revenue, directCosts), revenue, 0) * 100;
}

export function costPerM3(totalCost: number, volumeM3: number): number {
  return safeDivide(totalCost, volumeM3, 0);
}

export function profitPerM3(sellingPricePerM3: number, costPerM3Value: number): number {
  return sellingPricePerM3 - costPerM3Value;
}

export function dsoDays(accountsReceivable: number, creditSales: number, periodDays: number): number {
  return safeDivide(accountsReceivable, creditSales, 0) * periodDays;
}

export function inventoryValue(quantity: number, avgUnitCost: number): number {
  return quantity * avgUnitCost;
}

export function budgetVariance(actual: number, budget: number): number {
  return actual - budget;
}

export function budgetVariancePercent(actual: number, budget: number): number {
  return safeDivide(actual - budget, budget, 0) * 100;
}

export function achievementPercent(actual: number, budget: number): number {
  return safeDivide(actual, budget, 0) * 100;
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-999, Math.min(999, value));
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}
