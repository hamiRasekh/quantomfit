import { FinancialCurrencyUnit } from '@/features/tenant-panel/theme';

import { FINANCIAL_MOCK, MOCK_GRADES } from '../mock/dataset';
import { FinancialAggregate } from '../types/aggregate';
import { aggregateToDataset, FinancialDataset } from './aggregateAdapter';
import {
  FinancialAlert,
  FinancialFilters,
  FinancialKpi,
  FinancialPageId,
  FinancialPagePayload,
} from '../types';
import { grossMarginPercent, grossProfit, sum } from '../utils/calculations';
import {
  filterByCustomerId,
  filterByEntity,
  filterByGrade,
  filterByPaymentStatus,
  filterByPlant,
  filterBySupplierId,
  plantScopeFactor,
} from '../utils/filterMock';
import { formatCount, formatDays, formatM3, formatMoney, formatPercent } from '../utils/format';

function buildOverview(
  unit: FinancialCurrencyUnit,
  filters: FinancialFilters,
  dataset: FinancialDataset,
): FinancialPagePayload {
  const allPlants = dataset.plants;
  const plants = filterByPlant(allPlants, filters);
  const scope = plantScopeFactor(filters, allPlants.length);
  const o = dataset.overview;
  const revenue = o?.grossRevenue ?? sum(plants.map((p) => p.revenue));
  const costs = o?.directCosts ?? sum(
    plants.map(
      (p) => p.materialCost + p.productionCost + p.transportCost + p.pumpCost + p.overheadCost,
    ),
  );
  const gp = grossProfit(revenue, costs);
  const volume = o?.totalVolumeM3 ?? sum(plants.map((p) => p.volumeM3));
  const receivables = filterByPaymentStatus(
    filterByCustomerId(dataset.receivables, filters),
    filters.paymentStatus,
  );
  const receivableTotal = (o?.totalReceivables ?? sum(receivables.map((r) => r.totalReceivable))) * scope;
  const overdue = (o?.overdueReceivables ?? sum(receivables.map((r) => r.overdue))) * scope;
  const payables =
    (o?.totalPayables ?? sum(filterBySupplierId(dataset.payables, filters).map((p) => p.totalPayable))) *
    scope;
  const cf = dataset.cashFlow;

  const kpis: FinancialKpi[] = [
    {
      id: 'sales-today',
      label: 'فروش امروز',
      value: formatMoney(o?.salesToday ?? 0, unit, true),
      icon: 'solar:cart-large-2-bold-duotone',
    },
    {
      id: 'sales-month',
      label: 'فروش ماه جاری',
      value: formatMoney(o?.salesMonth ?? 0, unit, true),
      icon: 'solar:chart-2-bold-duotone',
    },
    {
      id: 'sales-range',
      label: 'فروش بازه انتخابی',
      value: formatMoney(o?.salesRange ?? revenue, unit, true),
      icon: 'solar:graph-up-bold-duotone',
    },
    { id: 'gross-profit', label: 'سود ناخالص', value: formatMoney(gp, unit, true), icon: 'solar:wallet-money-bold-duotone' },
    { id: 'gross-margin', label: 'حاشیه سود ناخالص', value: formatPercent(grossMarginPercent(revenue, costs)), icon: 'solar:percent-bold-duotone' },
    { id: 'cost-m3', label: 'هزینه تولید هر m³', value: formatMoney(costs / Math.max(volume, 1), unit), icon: 'solar:box-bold-duotone' },
    { id: 'profit-m3', label: 'سود هر m³', value: formatMoney(gp / Math.max(volume, 1), unit), icon: 'solar:medal-ribbons-star-bold-duotone' },
    { id: 'receivable', label: 'کل مطالبات', value: formatMoney(receivableTotal, unit, true), icon: 'solar:bill-list-bold-duotone' },
    { id: 'overdue', label: 'مطالبات سررسید گذشته', value: formatMoney(overdue, unit, true), severity: 'warning', icon: 'solar:danger-bold-duotone' },
    { id: 'payable', label: 'بدهی تأمین‌کنندگان', value: formatMoney(payables, unit, true), icon: 'solar:hand-money-bold-duotone' },
    {
      id: 'liquidity',
      label: 'مانده نقدینگی',
      value: formatMoney((cf?.bankBalance ?? 0) + (cf?.cashBalance ?? 0), unit, true),
      icon: 'solar:safe-square-bold-duotone',
    },
    {
      id: 'cash-in',
      label: 'جریان نقدی ورودی (ماه)',
      value: formatMoney(cf?.inMonth ?? 0, unit, true),
      icon: 'solar:arrow-down-bold-duotone',
    },
    {
      id: 'cash-out',
      label: 'جریان نقدی خروجی (ماه)',
      value: formatMoney(cf?.outMonth ?? 0, unit, true),
      icon: 'solar:arrow-up-bold-duotone',
    },
    {
      id: 'uninvoiced',
      label: 'سفارش فاکتورنشده',
      value: formatCount(o?.uninvoicedOrders ?? 0),
      unit: 'count',
      icon: 'solar:document-add-bold-duotone',
      severity: (o?.uninvoicedOrders ?? 0) > 0 ? 'warning' : 'normal',
    },
    {
      id: 'loss-projects',
      label: 'سفارش‌های زیان‌ده',
      value: formatCount(o?.lossMakingOrders ?? 0),
      unit: 'count',
      severity: (o?.lossMakingOrders ?? 0) > 0 ? 'danger' : 'normal',
      icon: 'solar:graph-down-bold-duotone',
    },
  ];

  const dayLabels = dataset.salesByDay.map((d) => d.day);

  return {
    title: 'نمای کلی مالی',
    description: 'شاخص‌های کلیدی مالی — داده زنده از سفارشات، مشتریان و انبار.',
    kpis,
    charts: [
      {
        id: 'sales-trend',
        title: 'روند فروش هفتگی',
        type: 'area',
        categories: dayLabels,
        series: [{ name: 'فروش', data: dataset.salesByDay.map((d) => d.amount / 1_000_000) }],
      },
      {
        id: 'cash-trend',
        title: 'ورودی و خروجی نقدی',
        type: 'bar',
        categories: cf?.dayLabels ?? dayLabels,
        series: [
          { name: 'ورودی', data: dataset.cashIn },
          { name: 'خروجی', data: dataset.cashOut },
        ],
      },
    ],
    tables: [],
    alerts: dataset.alerts.slice(0, 6),
  };
}

function mockDataset(): FinancialDataset {
  return {
    plants: FINANCIAL_MOCK.plants,
    concreteCosts: FINANCIAL_MOCK.concreteCosts,
    receivables: FINANCIAL_MOCK.receivables,
    payables: FINANCIAL_MOCK.payables,
    materials: FINANCIAL_MOCK.materials,
    fleet: FINANCIAL_MOCK.fleet,
    profitability: FINANCIAL_MOCK.profitability,
    contracts: FINANCIAL_MOCK.contracts,
    invoices: FINANCIAL_MOCK.invoices,
    inventory: FINANCIAL_MOCK.inventory,
    budget: FINANCIAL_MOCK.budget,
    alerts: FINANCIAL_MOCK.alerts,
    salesByDay: FINANCIAL_MOCK.salesByDay,
    cashIn: FINANCIAL_MOCK.cashIn,
    cashOut: FINANCIAL_MOCK.cashOut,
  };
}

export function buildFinancialPagePayload(
  pageId: FinancialPageId,
  filters: FinancialFilters,
  unit: FinancialCurrencyUnit,
  aggregate?: FinancialAggregate,
): FinancialPagePayload {
  const data: FinancialDataset = aggregate ? aggregateToDataset(aggregate) : mockDataset();

  const plants = filterByPlant(data.plants, filters);

  switch (pageId) {
    case 'overview':
      return buildOverview(unit, filters, data);

    case 'plants': {
      const rows = plants.map((p) => {
        const direct = p.materialCost + p.productionCost + p.transportCost + p.pumpCost;
        const gp = grossProfit(p.revenue, direct + p.overheadCost);
        return {
          plant: p.plantName,
          revenue: formatMoney(p.revenue, unit, true),
          material: formatMoney(p.materialCost, unit, true),
          production: formatMoney(p.productionCost, unit, true),
          transport: formatMoney(p.transportCost, unit, true),
          pump: formatMoney(p.pumpCost, unit, true),
          overhead: formatMoney(p.overheadCost, unit, true),
          gross: formatMoney(gp, unit, true),
          margin: formatPercent(grossMarginPercent(p.revenue, direct + p.overheadCost)),
          volume: formatM3(p.volumeM3),
        };
      });
      return {
        title: 'سود و زیان کارخانه‌ها',
        description: 'کارخانه‌ها از تنظیمات میکسرها — درآمد و هزینه از سفارشات و گزارش بهای تمام‌شده.',
        kpis: [
          { id: 'rev', label: 'کل درآمد', value: formatMoney(sum(plants.map((p) => p.revenue)), unit, true), icon: 'solar:wallet-bold-duotone' },
          { id: 'vol', label: 'حجم فروش', value: formatM3(sum(plants.map((p) => p.volumeM3))), icon: 'solar:box-bold-duotone' },
        ],
        charts: [
          {
            id: 'plant-rev',
            title: 'درآمد کارخانه‌ها',
            type: 'bar',
            categories: plants.map((p) => p.plantName),
            series: [{ name: 'درآمد', data: plants.map((p) => p.revenue / 1_000_000_000) }],
          },
          {
            id: 'plant-margin',
            title: 'حاشیه سود',
            type: 'donut',
            categories: plants.map((p) => p.plantName),
            series: plants.map((p) => {
              const c = p.materialCost + p.productionCost + p.transportCost + p.pumpCost + p.overheadCost;
              return grossMarginPercent(p.revenue, c);
            }),
          },
        ],
        tables: [
          {
            id: 'plants-table',
            title: 'جدول سود و زیان پلنت‌ها',
            columns: [
              { id: 'plant', label: 'کارخانه' },
              { id: 'volume', label: 'حجم m³', align: 'right' },
              { id: 'revenue', label: 'درآمد', align: 'right' },
              { id: 'material', label: 'مواد', align: 'right' },
              { id: 'production', label: 'تولید', align: 'right' },
              { id: 'transport', label: 'حمل', align: 'right' },
              { id: 'gross', label: 'سود ناخالص', align: 'right' },
              { id: 'margin', label: 'حاشیه', align: 'right' },
            ],
            rows,
          },
        ],
        alerts: data.alerts.filter((a) => a.category === 'فروش' || a.category === 'پروژه'),
      };
    }

    case 'cost-per-m3': {
      const costs = filterByGrade(data.concreteCosts, filters.concreteGrade);
      const rows = costs.map((c) => ({
        grade: c.grade,
        sell: formatMoney(c.sellingPricePerM3, unit),
        total: formatMoney(c.totalCostPerM3, unit),
        profit: formatMoney(c.profitPerM3, unit),
        margin: formatPercent(c.marginPercent),
        volume: formatM3(c.volumeM3),
        ai: c.aiStandardCostPerM3 ? formatMoney(c.aiStandardCostPerM3, unit) : '—',
        warn: c.marginPercent < 5 ? 'کم' : c.profitPerM3 < 0 ? 'زیان' : '—',
      }));
      return {
        title: 'قیمت تمام‌شده بتن',
        description: 'تمام‌شده از طرح اختلاط و قیمت میانگین انبار — فروش از سفارشات.',
        kpis: costs.map((c) => ({
          id: c.grade,
          label: `سود ${c.grade}`,
          value: formatMoney(c.profitPerM3, unit),
          hint: formatPercent(c.marginPercent),
          severity: c.profitPerM3 < 0 ? 'danger' : c.marginPercent < 8 ? 'warning' : 'success',
        })),
        charts: [
          {
            id: 'cost-stack',
            title: costs.length === 1 ? `ساختار هزینه ${costs[0].grade}` : 'ساختار هزینه (نمونه)',
            type: 'bar',
            categories: ['سیمان', 'ماسه', 'شن', 'افزودنی', 'تولید', 'حمل', 'سربار'],
            series: [
              {
                name: 'هزینه',
                data: (() => {
                  const c = costs.find((x) => x.grade === 'C30') ?? costs[0];
                  if (!c) return [];
                  return [
                    c.cementCost,
                    c.sandCost,
                    c.gravelCost,
                    c.admixtureCost,
                    c.productionCost,
                    c.transportCost,
                    c.overheadCost,
                  ].map((v) => v / 1000);
                })(),
              },
            ],
          },
        ],
        tables: [
          {
            id: 'cost-table',
            title: 'جدول قیمت تمام‌شده',
            columns: [
              { id: 'grade', label: 'رده' },
              { id: 'volume', label: 'حجم', align: 'right' },
              { id: 'sell', label: 'فروش/m³', align: 'right' },
              { id: 'total', label: 'تمام‌شده', align: 'right' },
              { id: 'ai', label: 'استاندارد AI', align: 'right' },
              { id: 'profit', label: 'سود/m³', align: 'right' },
              { id: 'margin', label: 'حاشیه', align: 'right' },
              { id: 'warn', label: 'هشدار', align: 'center' },
            ],
            rows,
          },
        ],
        alerts: costs.filter((c) => c.marginPercent < 8).map((c) => ({
          id: `cost-${c.grade}`,
          title: `حاشیه پایین ${c.grade}`,
          description: `حاشیه ${formatPercent(c.marginPercent)} — بررسی مصرف سیمان`,
          severity: c.profitPerM3 < 0 ? 'critical' : 'medium',
          category: 'تمام‌شده',
          createdAt: '1404/10/12',
        })),
      };
    }

    case 'sales': {
      const byCustomer = data.salesByCustomer ?? [];
      const byProduct = data.salesByProduct ?? [];
      const totalVol = byCustomer.reduce((s, c) => s + c.volumeM3, 0);
      const totalRev = byCustomer.reduce((s, c) => s + c.revenue, 0);
      const avgPrice = totalVol > 0 ? Math.round(totalRev / totalVol) : 0;
      const gradeRows = byProduct.filter((p) => p.grade);
      return {
        title: 'فروش و درآمد',
        description: 'داده زنده از سفارشات ثبت‌شده — تفکیک مشتری، محصول و رده بتن.',
        kpis: [
          { id: 'avg', label: 'میانگین نرخ فروش/m³', value: formatMoney(avgPrice, unit), icon: 'solar:tag-price-bold-duotone' },
          {
            id: 'orders',
            label: 'تعداد سفارش',
            value: formatCount(byCustomer.reduce((s, c) => s + c.orderCount, 0)),
            unit: 'count',
            icon: 'solar:cart-large-2-bold-duotone',
          },
          {
            id: 'rev',
            label: 'فروش بازه',
            value: formatMoney(totalRev, unit, true),
            icon: 'solar:graph-up-bold-duotone',
          },
        ],
        charts: [
          {
            id: 'sales-day',
            title: 'فروش روزانه',
            type: 'line',
            categories: data.salesByDay.map((d) => d.day),
            series: [{ name: 'فروش', data: data.salesByDay.map((d) => d.amount / 1e9) }],
          },
          {
            id: 'sales-grade',
            title: 'فروش به تفکیک رده',
            type: 'donut',
            categories: gradeRows.length ? gradeRows.map((p) => p.grade!) : [...MOCK_GRADES],
            series: gradeRows.length
              ? gradeRows.map((p) => p.revenue / 1e8)
              : [32, 28, 26, 14],
          },
        ],
        tables: [
          {
            id: 'sales-customer',
            title: 'فروش مشتریان',
            columns: [
              { id: 'name', label: 'مشتری' },
              { id: 'vol', label: 'حجم', align: 'right' },
              { id: 'rev', label: 'فروش', align: 'right' },
            ],
            rows: byCustomer.map((c) => ({
              name: c.customerName,
              vol: formatM3(c.volumeM3),
              rev: formatMoney(c.revenue, unit, true),
            })),
          },
        ],
        alerts: [],
      };
    }

    case 'receivables': {
      const receivables = filterByPaymentStatus(
        filterByCustomerId(data.receivables, filters),
        filters.paymentStatus,
      );
      const rows = receivables.map((r) => ({
        customerId: r.customerId,
        customer: r.customerName,
        total: formatMoney(r.totalReceivable, unit, true),
        overdue: formatMoney(r.overdue, unit, true),
        dso: formatDays(r.dsoDays),
        credit: formatMoney(r.creditBalance, unit, true),
        a30: formatMoney(r.aging0_30, unit, true),
        a90: formatMoney(r.aging90Plus, unit, true),
      }));
      return {
        title: 'مطالبات و وصولی‌ها',
        description: 'مانده مشتریان از پرونده مشتری + Aging بر اساس سفارشات باز.',
        kpis: [
          { id: 'total', label: 'کل مطالبات', value: formatMoney(sum(receivables.map((r) => r.totalReceivable)), unit, true), icon: 'solar:bill-list-bold-duotone' },
          {
            id: 'dso',
            label: 'DSO میانگین',
            value: formatDays(
              receivables.length
                ? Math.round(sum(receivables.map((r) => r.dsoDays)) / receivables.length)
                : 0,
            ),
            icon: 'solar:calendar-bold-duotone',
          },
        ],
        charts: [
          {
            id: 'aging',
            title: 'Aging مطالبات',
            type: 'bar',
            categories: ['0-30', '31-60', '61-90', '90+'],
            series: [
              {
                name: 'مبلغ',
                data: [
                  sum(receivables.map((r) => r.aging0_30)) / 1e9,
                  sum(receivables.map((r) => r.aging31_60)) / 1e9,
                  sum(receivables.map((r) => r.aging61_90)) / 1e9,
                  sum(receivables.map((r) => r.aging90Plus)) / 1e9,
                ],
              },
            ],
          },
        ],
        tables: [{ id: 'ar', title: 'مشتریان بدهکار', columns: [{ id: 'customer', label: 'مشتری' }, { id: 'total', label: 'کل', align: 'right' }, { id: 'overdue', label: 'معوق', align: 'right' }, { id: 'dso', label: 'DSO', align: 'right' }, { id: 'credit', label: 'مانده اعتبار', align: 'right' }, { id: 'a90', label: '+90 روز', align: 'right' }], rows }],
        alerts: data.alerts.filter((a) => a.category === 'مطالبات'),
      };
    }

    case 'payables': {
      const payables = filterBySupplierId(data.payables, filters);
      const rows = payables.map((p) => ({
        supplier: p.supplierName,
        cat: p.category,
        total: formatMoney(p.totalPayable, unit, true),
        week: formatMoney(p.dueThisWeek, unit, true),
        inv: formatCount(p.unpaidInvoices),
        avg: formatMoney(p.avgUnitPrice, unit),
      }));
      return {
        title: 'بدهی‌ها و پرداختنی‌ها',
        description: 'بدهی تأمین‌کنندگان مواد تولید — ثبت خرید در «فاکتور ورود مواد» بخش مالی.',
        kpis: [{ id: 'total', label: 'کل بدهی', value: formatMoney(sum(payables.map((p) => p.totalPayable)), unit, true), icon: 'solar:hand-money-bold-duotone' }],
        charts: [{ id: 'pay-cat', title: 'بدهی به تفکیک دسته', type: 'donut', categories: payables.map((p) => p.category), series: payables.map((p) => p.totalPayable / 1e8) }],
        tables: [{ id: 'ap', title: 'تأمین‌کنندگان', columns: [{ id: 'supplier', label: 'تأمین‌کننده' }, { id: 'cat', label: 'دسته' }, { id: 'total', label: 'بدهی', align: 'right' }, { id: 'week', label: 'سررسید هفته', align: 'right' }, { id: 'inv', label: 'فاکتور باز', align: 'right' }], rows }],
        alerts: [],
      };
    }

    case 'cash-flow': {
      const cf = data.cashFlow;
      const f7 = cf?.forecast7 ?? 0;
      return {
        title: 'جریان نقدی و نقدینگی',
        description: 'برآورد از فروش سفارشات و خرید مواد (ثبت انبار) — اتصال بانک در فاز بعد.',
        kpis: [
          { id: 'bank', label: 'مانده بانک (برآورد)', value: formatMoney(cf?.bankBalance ?? 0, unit, true), icon: 'solar:card-bold-duotone' },
          { id: 'cash', label: 'مانده صندوق (برآورد)', value: formatMoney(cf?.cashBalance ?? 0, unit, true), icon: 'solar:safe-square-bold-duotone' },
          {
            id: 'f7',
            label: 'پیش‌بینی ۷ روز',
            value: formatMoney(f7, unit, true),
            severity: f7 < 0 ? 'danger' : 'normal',
            icon: 'solar:danger-bold-duotone',
          },
          { id: 'f30', label: 'پیش‌بینی ۳۰ روز', value: formatMoney(cf?.forecast30 ?? 0, unit, true), icon: 'solar:chart-2-bold-duotone' },
        ],
        charts: [
          {
            id: 'cash-io',
            title: 'ورودی / خروجی نقدی',
            type: 'area',
            categories: cf?.dayLabels ?? data.salesByDay.map((d) => d.day),
            series: [
              { name: 'ورودی', data: data.cashIn },
              { name: 'خروجی', data: data.cashOut },
            ],
          },
        ],
        tables: [],
        alerts: data.alerts.filter((a) => a.category === 'نقدینگی'),
      };
    }

    case 'materials-cost': {
      const rows = data.materials.map((m) => ({
        mat: m.materialName,
        qty: new Intl.NumberFormat('fa-IR').format(m.consumedQty),
        amt: formatMoney(m.consumedAmount, unit, true),
        avg: formatMoney(m.avgPurchasePrice, unit),
        stock: formatMoney(m.stockValue, unit, true),
        var: formatPercent(m.variancePercent),
        waste: formatPercent(m.wastePercent),
        impact: formatMoney(m.profitImpactPerM3, unit),
      }));
      return {
        title: 'هزینه مواد اولیه',
        description: 'مصرف (خروج انبار)، موجودی و قیمت میانگین — داده زنده از مواد اولیه.',
        kpis: data.materials.slice(0, 4).map((m) => ({
          id: m.materialKey,
          label: m.materialName,
          value: formatMoney(m.consumedAmount, unit, true),
          hint: formatPercent(m.priceTrendPercent) + ' روند قیمت',
        })),
        charts: [{ id: 'mat-price', title: 'روند افزایش قیمت مواد', type: 'line', categories: data.materials.map((m) => m.materialName), series: [{ name: '٪ تغییر', data: data.materials.map((m) => m.priceTrendPercent) }] }],
        tables: [{ id: 'mat', title: 'جدول مواد', columns: [{ id: 'mat', label: 'ماده' }, { id: 'qty', label: 'مصرف', align: 'right' }, { id: 'amt', label: 'مبلغ', align: 'right' }, { id: 'var', label: 'انحراف', align: 'right' }, { id: 'impact', label: 'اثر سود/m³', align: 'right' }], rows }],
        alerts: data.alerts.filter((a) => a.category === 'مواد'),
      };
    }

    case 'fleet': {
      const fleetRows = data.fleet ?? [];
      const rows = fleetRows.map((f) => ({
        truck: f.vehicleName,
        trips: formatCount(f.trips),
        vol: formatM3(f.volumeM3),
        fuel: formatMoney(f.fuelCost, unit, true),
        costM3: formatMoney(f.costPerM3, unit),
        costKm: formatMoney(f.costPerKm, unit),
        ret: formatM3(f.returnConcreteM3),
      }));
      return {
        title: 'هزینه حمل و ناوگان',
        description:
          fleetRows.length > 0
            ? 'هزینه میکسرها، مسیرها و بتن برگشتی.'
            : 'ماژول ناوگان هنوز فعال نیست — پس از اتصال Fleet داده نمایش داده می‌شود.',
        kpis: [
          {
            id: 'cost-m3',
            label: 'میانگین حمل/m³',
            value: fleetRows.length ? formatMoney(295_000, unit) : '—',
            icon: 'solar:bus-bold-duotone',
          },
        ],
        charts:
          fleetRows.length > 0
            ? [
                {
                  id: 'fleet-cost',
                  title: 'هزینه ناوگان',
                  type: 'bar',
                  categories: fleetRows.map((f) => f.vehicleName),
                  series: [
                    {
                      name: 'هزینه',
                      data: fleetRows.map((f) => (f.fuelCost + f.maintenanceCost) / 1e8),
                    },
                  ],
                },
              ]
            : [],
        tables: [{ id: 'fleet', title: 'جدول ناوگان', columns: [{ id: 'truck', label: 'خودرو' }, { id: 'trips', label: 'سرویس', align: 'right' }, { id: 'vol', label: 'حجم', align: 'right' }, { id: 'costM3', label: 'هزینه/m³', align: 'right' }, { id: 'ret', label: 'برگشتی', align: 'right' }], rows }],
        alerts: [],
      };
    }

    case 'customer-profit': {
      const profitability = filterByPaymentStatus(
        filterByEntity(data.profitability, filters),
        filters.paymentStatus,
      );
      const rows = profitability.map((p) => ({
        name: p.entityName,
        type: p.entityType === 'customer' ? 'مشتری' : 'پروژه',
        vol: formatM3(p.volumeM3),
        rev: formatMoney(p.revenue, unit, true),
        margin: formatPercent(p.marginPercent),
        due: formatMoney(p.balanceDue, unit, true),
        status: p.paymentStatus,
      }));
      return {
        title: 'سودآوری مشتریان و پروژه‌ها',
        description: 'رتبه‌بندی سودده و زیان‌ده — حجم بالا ≠ سود بالا.',
        kpis: [{ id: 'top', label: 'بهترین حاشیه', value: formatPercent(18), icon: 'solar:crown-bold-duotone' }],
        charts: [{ id: 'profit-bar', title: 'سود ناخالص', type: 'bar', categories: profitability.slice(0, 5).map((p) => p.entityName), series: [{ name: 'سود', data: profitability.slice(0, 5).map((p) => p.grossProfit / 1e9) }] }],
        tables: [{ id: 'profit', title: 'جدول سودآوری', columns: [{ id: 'name', label: 'نام' }, { id: 'type', label: 'نوع' }, { id: 'vol', label: 'حجم', align: 'right' }, { id: 'rev', label: 'فروش', align: 'right' }, { id: 'margin', label: 'حاشیه', align: 'right' }, { id: 'due', label: 'مانده', align: 'right' }], rows }],
        alerts: data.alerts.filter((a) => a.category === 'پروژه'),
      };
    }

    case 'contracts': {
      const rows = data.contracts.map((c) => ({
        title: c.title,
        type: c.type === 'quote' ? 'پیش‌فاکتور' : c.type === 'contract' ? 'قرارداد' : 'سفارش',
        amount: formatMoney(c.amount, unit, true),
        status: c.status,
        margin: c.marginPercent != null ? formatPercent(c.marginPercent) : '—',
        risk: c.risk === 'high' ? 'بالا' : c.risk === 'medium' ? 'متوسط' : 'پایین',
      }));
      return {
        title: 'قراردادها، پیش‌فاکتورها و سفارش‌ها',
        description: 'کنترل ریسک اعتباری و فروش زیر تمام‌شده قبل از تأیید.',
        kpis: [{ id: 'open-q', label: 'پیش‌فاکتور باز', value: formatCount(4), icon: 'solar:document-text-bold-duotone' }],
        charts: [],
        tables: [{ id: 'contracts', title: 'لیست', columns: [{ id: 'title', label: 'عنوان' }, { id: 'type', label: 'نوع' }, { id: 'amount', label: 'مبلغ', align: 'right' }, { id: 'margin', label: 'حاشیه', align: 'right' }, { id: 'risk', label: 'ریسک', align: 'center' }], rows }],
        alerts: data.alerts.filter((a) => a.category === 'فروش'),
      };
    }

    case 'invoices': {
      const rows = data.invoices.map((i) => ({
        order: i.orderNo,
        customer: i.customerName,
        del: formatM3(i.deliveredM3),
        inv: formatM3(i.invoicedM3),
        var: formatM3(i.varianceM3),
        ret: formatM3(i.returnM3),
        status: i.status,
      }));
      return {
        title: 'فاکتورها و مغایرت تحویل',
        description: 'سفارشات در وضعیت مالی / تحویل — مغایرت از مقادیر خط سفارش.',
        kpis: [{ id: 'uninv', label: 'تحویل فاکتورنشده', value: formatCount(12), severity: 'warning', icon: 'solar:document-add-bold-duotone' }],
        charts: [],
        tables: [{ id: 'inv', title: 'مغایرت‌ها', columns: [{ id: 'order', label: 'سفارش' }, { id: 'customer', label: 'مشتری' }, { id: 'del', label: 'تحویل', align: 'right' }, { id: 'inv', label: 'فاکتور', align: 'right' }, { id: 'var', label: 'اختلاف', align: 'right' }, { id: 'status', label: 'وضعیت' }], rows }],
        alerts: data.alerts.filter((a) => a.category === 'فاکتور'),
      };
    }

    case 'inventory-value': {
      const rows = data.inventory.map((i) => ({
        mat: i.materialName,
        qty: `${new Intl.NumberFormat('fa-IR').format(i.quantity)} ${i.unit}`,
        value: formatMoney(i.value, unit, true),
        turn: formatDays(i.turnoverDays),
        critical: i.isCritical ? 'بله' : '—',
      }));
      return {
        title: 'ارزش موجودی انبار',
        description: 'ارزش ریالی موجودی مصالح و خواب سرمایه.',
        kpis: [{ id: 'total', label: 'کل ارزش موجودی', value: formatMoney(sum(data.inventory.map((i) => i.value)), unit, true), icon: 'solar:box-bold-duotone' }],
        charts: [{ id: 'inv-val', title: 'ارزش به تفکیک ماده', type: 'donut', categories: data.inventory.map((i) => i.materialName), series: data.inventory.map((i) => i.value / 1e8) }],
        tables: [{ id: 'stock', title: 'موجودی', columns: [{ id: 'mat', label: 'ماده' }, { id: 'qty', label: 'مقدار', align: 'right' }, { id: 'value', label: 'ارزش', align: 'right' }, { id: 'turn', label: 'گردش', align: 'right' }, { id: 'critical', label: 'بحرانی', align: 'center' }], rows }],
        alerts: data.alerts.filter((a) => a.category === 'انبار'),
      };
    }

    case 'budget': {
      const rows = data.budget.map((b) => ({
        cat: b.category,
        budget: formatMoney(b.budget, unit, true),
        actual: formatMoney(b.actual, unit, true),
        var: formatMoney(b.variance, unit, true),
        varPct: formatPercent(b.variancePercent),
        ach: formatPercent(b.achievementPercent),
      }));
      return {
        title: 'بودجه، برنامه و انحرافات',
        description: 'مقایسه Budget vs Actual.',
        kpis: [{ id: 'sales-ach', label: 'تحقق فروش', value: formatPercent(94), icon: 'solar:target-bold-duotone' }],
        charts: [{ id: 'budget', title: 'بودجه در برابر واقعی', type: 'bar', categories: data.budget.map((b) => b.category), series: [{ name: 'بودجه', data: data.budget.map((b) => b.budget / 1e9) }, { name: 'واقعی', data: data.budget.map((b) => b.actual / 1e9) }] }],
        tables: [{ id: 'budget-t', title: 'انحرافات', columns: [{ id: 'cat', label: 'عنوان' }, { id: 'budget', label: 'بودجه', align: 'right' }, { id: 'actual', label: 'واقعی', align: 'right' }, { id: 'var', label: 'انحراف', align: 'right' }, { id: 'varPct', label: '٪ انحراف', align: 'right' }], rows }],
        alerts: [],
      };
    }

    case 'alerts':
      return {
        title: 'هشدارها و کنترل‌های مالی',
        description: 'مرکز هشدارهای مالی برای تصمیم سریع.',
        kpis: [
          { id: 'crit', label: 'بحرانی', value: formatCount(data.alerts.filter((a) => a.severity === 'critical').length), severity: 'danger' },
          { id: 'high', label: 'بالا', value: formatCount(data.alerts.filter((a) => a.severity === 'high').length), severity: 'warning' },
        ],
        charts: [],
        tables: [
          {
            id: 'alerts-t',
            title: 'لیست هشدارها',
            columns: [
              { id: 'title', label: 'عنوان' },
              { id: 'cat', label: 'دسته' },
              { id: 'sev', label: 'شدت', align: 'center' },
              { id: 'date', label: 'تاریخ', align: 'right' },
            ],
            rows: data.alerts.map((a) => ({
              title: a.title,
              cat: a.category,
              sev: a.severity === 'critical' ? 'بحرانی' : a.severity === 'high' ? 'بالا' : a.severity === 'medium' ? 'متوسط' : 'پایین',
              date: a.createdAt,
              desc: a.description,
            })),
          },
        ],
        alerts: data.alerts,
      };

    default:
      return buildOverview(unit, filters, data);
  }
}
