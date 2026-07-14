import { OrderWorkflowStage } from '../types';

export { OrderWorkflowStage };

export type OrderWorkflowStep = {
  id: OrderWorkflowStage;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  toolHref?: string;
  toolLabel?: string;
};

export const ORDER_WORKFLOW_STEPS: OrderWorkflowStep[] = [
  {
    id: OrderWorkflowStage.REGISTERED,
    label: 'ثبت سفارش',
    shortLabel: 'ثبت',
    description: 'سفارش در سیستم ثبت شده و آماده ورود به چرخه بررسی است.',
    icon: 'solar:clipboard-list-bold-duotone',
  },
  {
    id: OrderWorkflowStage.MIX_DESIGN,
    label: 'طرح اختلاط',
    shortLabel: 'طرح',
    description: 'تعیین یا بررسی طرح اختلاط متناسب با رده بتن و نوع کاربرد.',
    icon: 'solar:test-tube-bold-duotone',
    toolHref: '/concrete-mix/builder',
    toolLabel: 'رفتن به سازنده طرح اختلاط',
  },
  {
    id: OrderWorkflowStage.INVENTORY_CHECK,
    label: 'بررسی موجودی انبار',
    shortLabel: 'انبار',
    description: 'کنترل موجودی مواد اولیه و شناسایی کمبودهای احتمالی.',
    icon: 'solar:box-bold-duotone',
    toolHref: '/materials/inventory',
    toolLabel: 'رفتن به موجودی انبار',
  },
  {
    id: OrderWorkflowStage.PRODUCTION_FEASIBILITY,
    label: 'امکان‌سنجی تولید',
    shortLabel: 'امکان‌سنجی',
    description: 'بررسی ظرفیت تولید، زمان‌بندی و امکان تحویل در موعد مقرر.',
    icon: 'solar:graph-up-bold-duotone',
    toolHref: '/concrete-mix/predictor',
    toolLabel: 'رفتن به پیش‌بینی تولید',
  },
  {
    id: OrderWorkflowStage.PRODUCTION_READY,
    label: 'آماده تولید',
    shortLabel: 'آماده',
    description: 'همه بررسی‌ها انجام شده؛ سفارش می‌تواند وارد زمان‌بندی و تولید شود.',
    icon: 'solar:check-circle-bold-duotone',
    toolHref: '/orders/schedule',
    toolLabel: 'رفتن به زمان‌بندی',
  },
];

export const ORDER_WORKFLOW_LABELS: Record<OrderWorkflowStage, string> = ORDER_WORKFLOW_STEPS.reduce(
  (acc, step) => {
    acc[step.id] = step.label;
    return acc;
  },
  {} as Record<OrderWorkflowStage, string>,
);

export function resolveWorkflowStage(stage?: OrderWorkflowStage | null): OrderWorkflowStage {
  return stage ?? OrderWorkflowStage.REGISTERED;
}

export function workflowStageIndex(stage?: OrderWorkflowStage | null): number {
  const resolved = resolveWorkflowStage(stage);
  const index = ORDER_WORKFLOW_STEPS.findIndex((s) => s.id === resolved);
  return index >= 0 ? index : 0;
}

export function nextWorkflowStage(stage?: OrderWorkflowStage | null): OrderWorkflowStage | null {
  const index = workflowStageIndex(stage);
  return ORDER_WORKFLOW_STEPS[index + 1]?.id ?? null;
}

export function workflowStageProgress(stage?: OrderWorkflowStage | null): number {
  const index = workflowStageIndex(stage);
  if (ORDER_WORKFLOW_STEPS.length <= 1) return 0;
  return Math.round((index / (ORDER_WORKFLOW_STEPS.length - 1)) * 100);
}
