import {
  BudgetVariance,
  ConcreteCostBreakdown,
  ContractFinancialStatus,
  CustomerReceivable,
  FinancialAlert,
  FleetCostItem,
  InventoryValuation,
  InvoiceReconciliation,
  MaterialCostItem,
  PlantProfitability,
  ProjectProfitability,
  SupplierPayable,
} from '../types';
import {
  achievementPercent,
  budgetVariance,
  budgetVariancePercent,
  grossMarginPercent,
  grossProfit,
  profitPerM3,
} from '../utils/calculations';

export const MOCK_PLANTS = [
  { id: 'plant-north', name: 'کارخانه شمال' },
  { id: 'plant-west', name: 'پلنت غرب' },
  { id: 'plant-central', name: 'بچینگ مرکزی' },
];

export const MOCK_CUSTOMERS = [
  { id: 'cust-1', name: 'ساختمانی آسمان' },
  { id: 'cust-2', name: 'راه و ساختمان پارس' },
  { id: 'cust-3', name: 'توسعه بتن کیش' },
];

export const MOCK_PROJECTS = [
  { id: 'prj-1', name: 'برج مسکونی آوا' },
  { id: 'prj-2', name: 'پل بزرگراه امام' },
  { id: 'prj-3', name: 'مجتمع تجاری نور' },
];

export const MOCK_GRADES = ['C20', 'C25', 'C30', 'C35'] as const;

function buildPlants(): PlantProfitability[] {
  return MOCK_PLANTS.map((p, i) => {
    const revenue = 8_200_000_000 + i * 1_100_000_000;
    const materialCost = revenue * (0.42 + i * 0.02);
    const productionCost = revenue * 0.12;
    const transportCost = revenue * 0.09;
    const pumpCost = revenue * 0.04;
    const overheadCost = revenue * 0.07;
    return {
      plantId: p.id,
      plantName: p.name,
      revenue,
      materialCost,
      productionCost,
      transportCost,
      pumpCost,
      overheadCost,
      volumeM3: 4200 + i * 680,
    };
  });
}

function buildConcreteCosts(): ConcreteCostBreakdown[] {
  const basePrices = { C20: 2_450_000, C25: 2_620_000, C30: 2_840_000, C35: 3_050_000 };
  return MOCK_GRADES.map((grade) => {
    const selling = basePrices[grade as keyof typeof basePrices];
    const cement = selling * 0.28;
    const sand = selling * 0.12;
    const gravel = selling * 0.14;
    const admixture = selling * 0.04;
    const water = selling * 0.02;
    const other = selling * 0.03;
    const production = selling * 0.11;
    const transport = selling * 0.08;
    const pump = selling * 0.03;
    const overhead = selling * 0.06;
    const waste = selling * 0.02;
    const total =
      cement + sand + gravel + admixture + water + other + production + transport + pump + overhead + waste;
    const profit = profitPerM3(selling, total);
    const margin = grossMarginPercent(selling, total);
    return {
      grade,
      mixCode: `MIX-${grade}`,
      sellingPricePerM3: selling,
      cementCost: cement,
      sandCost: sand,
      gravelCost: gravel,
      admixtureCost: admixture,
      waterCost: water,
      otherMaterialCost: other,
      productionCost: production,
      transportCost: transport,
      pumpCost: pump,
      overheadCost: overhead,
      wasteCost: waste,
      totalCostPerM3: total,
      profitPerM3: profit,
      marginPercent: margin,
      volumeM3: 900 + MOCK_GRADES.indexOf(grade) * 220,
      aiStandardCostPerM3: total * (grade === 'C30' ? 0.97 : 1.02),
    };
  });
}

function buildReceivables(): CustomerReceivable[] {
  return MOCK_CUSTOMERS.map((c, i) => ({
    customerId: c.id,
    customerName: c.name,
    totalReceivable: 1_200_000_000 + i * 450_000_000,
    current: 700_000_000 + i * 100_000_000,
    overdue: 500_000_000 + i * 350_000_000,
    aging0_30: 400_000_000,
    aging31_60: 250_000_000 + i * 50_000_000,
    aging61_90: 180_000_000,
    aging90Plus: 370_000_000 + i * 120_000_000,
    creditLimit: 2_000_000_000,
    creditBalance: 800_000_000 - i * 100_000_000,
    dsoDays: 42 + i * 8,
    checksPending: 2 + i,
  }));
}

function buildPayables(): SupplierPayable[] {
  const items = [
    { id: 'sup-cement', name: 'سیمان تهران', category: 'سیمان' },
    { id: 'sup-sand', name: 'ماسه شهریار', category: 'شن و ماسه' },
    { id: 'sup-adm', name: 'افزودنی بتن‌پلاس', category: 'افزودنی' },
    { id: 'sup-fuel', name: 'پخش سوخت آریا', category: 'سوخت' },
  ];
  return items.map((s, i) => ({
    supplierId: s.id,
    supplierName: s.name,
    category: s.category,
    totalPayable: 600_000_000 + i * 180_000_000,
    dueThisWeek: 120_000_000 + i * 40_000_000,
    unpaidInvoices: 3 + i,
    avgUnitPrice: 85_000 + i * 12_000,
  }));
}

function buildMaterials(): MaterialCostItem[] {
  return [
    { key: 'cement', name: 'سیمان', qty: 4200, price: 92_000, stock: 380, unit: 'تن' },
    { key: 'sand', name: 'ماسه', qty: 9800, price: 38_000, stock: 1200, unit: 'تن' },
    { key: 'gravel', name: 'شن', qty: 8600, price: 41_000, stock: 950, unit: 'تن' },
    { key: 'admixture', name: 'افزودنی', qty: 42, price: 1_850_000, stock: 8, unit: 'تن' },
    { key: 'water', name: 'آب', qty: 1200, price: 8_500, stock: 0, unit: 'm³' },
  ].map((m) => ({
    materialKey: m.key,
    materialName: m.name,
    consumedQty: m.qty,
    consumedAmount: m.qty * m.price,
    avgPurchasePrice: m.price * 1.04,
    stockQty: m.stock,
    stockValue: m.stock * m.price,
    variancePercent: m.key === 'cement' ? 4.2 : -1.5,
    wastePercent: m.key === 'sand' ? 2.1 : 0.8,
    priceTrendPercent: m.key === 'cement' ? 6.5 : 1.2,
    profitImpactPerM3: m.key === 'cement' ? -48_000 : -8_000,
  }));
}

function buildFleet(): FleetCostItem[] {
  return Array.from({ length: 6 }, (_, i) => ({
    vehicleId: `truck-${i + 1}`,
    vehicleName: `میکسر ${i + 1}`,
    fuelCost: 180_000_000 + i * 20_000_000,
    maintenanceCost: 45_000_000 + i * 8_000_000,
    driverCost: 120_000_000,
    depreciationCost: 35_000_000,
    trips: 120 + i * 15,
    volumeM3: 850 + i * 90,
    costPerM3: 0,
    costPerKm: 0,
    returnConcreteM3: i === 2 ? 12 : 3,
  })).map((row) => {
    const total = row.fuelCost + row.maintenanceCost + row.driverCost + row.depreciationCost;
    return {
      ...row,
      costPerM3: row.volumeM3 > 0 ? total / row.volumeM3 : 0,
      costPerKm: 28_500 + row.trips * 40,
    };
  });
}

function buildProfitability(): ProjectProfitability[] {
  const rows: ProjectProfitability[] = [];
  MOCK_CUSTOMERS.forEach((c, ci) => {
    rows.push({
      entityId: c.id,
      entityName: c.name,
      entityType: 'customer',
      volumeM3: 2400 + ci * 400,
      revenue: 5_800_000_000 + ci * 900_000_000,
      avgSellingPrice: 2_650_000,
      actualCost: 4_900_000_000 + ci * 850_000_000,
      grossProfit: 0,
      marginPercent: 0,
      balanceDue: 400_000_000 + ci * 200_000_000,
      paymentStatus: ci === 2 ? 'معوق' : 'جاری',
      orderCount: 18 + ci * 4,
      returnM3: ci === 1 ? 28 : 6,
      discountAmount: 120_000_000,
    });
  });
  MOCK_PROJECTS.forEach((p, pi) => {
    const revenue = 3_200_000_000 + pi * 500_000_000;
    const cost = revenue * (pi === 2 ? 0.96 : 0.78);
    rows.push({
      entityId: p.id,
      entityName: p.name,
      entityType: 'project',
      volumeM3: 1100 + pi * 200,
      revenue,
      avgSellingPrice: 2_720_000,
      actualCost: cost,
      grossProfit: grossProfit(revenue, cost),
      marginPercent: grossMarginPercent(revenue, cost),
      balanceDue: 200_000_000,
      paymentStatus: pi === 2 ? 'معوق' : 'خوب',
      orderCount: 8 + pi,
      returnM3: pi === 2 ? 45 : 5,
      discountAmount: 60_000_000,
    });
  });
  return rows
    .map((r) => ({
      ...r,
      grossProfit: r.grossProfit || grossProfit(r.revenue, r.actualCost),
      marginPercent: r.marginPercent || grossMarginPercent(r.revenue, r.actualCost),
    }))
    .sort((a, b) => b.grossProfit - a.grossProfit)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));
}

function buildContracts(): ContractFinancialStatus[] {
  return [
    { id: 'q-1', title: 'پیش‌فاکتور برج آوا', type: 'quote', amount: 1_200_000_000, status: 'باز', risk: 'medium', marginPercent: 8 },
    { id: 'c-1', title: 'قرارداد پل امام', type: 'contract', amount: 8_500_000_000, status: 'فعال', risk: 'low', marginPercent: 14 },
    { id: 'o-1', title: 'سفارش C30 پروژه نور', type: 'order', amount: 420_000_000, status: 'در انتظار تأیید مالی', risk: 'high', marginPercent: -2, creditRisk: true },
    { id: 'o-2', title: 'سفارش حجم بالا کیش', type: 'order', amount: 2_100_000_000, status: 'زیر تمام‌شده', risk: 'high', marginPercent: 1 },
  ];
}

function buildInvoices(): InvoiceReconciliation[] {
  return [
    { id: 'inv-1', orderNo: 'ORD-1042', customerName: 'آسمان', deliveredM3: 120, invoicedM3: 118, varianceM3: 2, invoicedAmount: 310_000_000, paidAmount: 0, returnM3: 2, status: 'تحویل‌شده / فاکتورنشده' },
    { id: 'inv-2', orderNo: 'ORD-1038', customerName: 'پارس', deliveredM3: 85, invoicedM3: 85, varianceM3: 0, invoicedAmount: 228_000_000, paidAmount: 80_000_000, returnM3: 0, status: 'فاکتورشده / تسویه‌ناقص' },
    { id: 'inv-3', orderNo: 'ORD-1031', customerName: 'کیش', deliveredM3: 200, invoicedM3: 195, varianceM3: 5, invoicedAmount: 540_000_000, paidAmount: 540_000_000, returnM3: 8, status: 'نیازمند بررسی' },
  ];
}

function buildInventory(): InventoryValuation[] {
  return buildMaterials().map((m) => ({
    materialName: m.materialName,
    quantity: m.stockQty,
    unit: m.materialKey === 'water' ? 'm³' : 'تن',
    value: m.stockValue,
    turnoverDays: m.materialKey === 'admixture' ? 45 : 18,
    minStock: m.materialKey === 'cement' ? 200 : 400,
    isCritical: m.materialKey === 'cement' && m.stockQty < 400,
    varianceQty: m.materialKey === 'sand' ? -24 : 0,
  }));
}

function buildBudget(): BudgetVariance[] {
  const rows = [
    { category: 'فروش', budget: 28_000_000_000, actual: 26_400_000_000 },
    { category: 'هزینه مواد', budget: 11_500_000_000, actual: 12_100_000_000 },
    { category: 'هزینه حمل', budget: 2_400_000_000, actual: 2_650_000_000 },
    { category: 'هزینه تولید', budget: 3_200_000_000, actual: 3_050_000_000 },
    { category: 'تعمیرات', budget: 680_000_000, actual: 820_000_000 },
    { category: 'سود ناخالص', budget: 6_500_000_000, actual: 5_720_000_000 },
  ];
  return rows.map((r) => ({
    category: r.category,
    budget: r.budget,
    actual: r.actual,
    variance: budgetVariance(r.actual, r.budget),
    variancePercent: budgetVariancePercent(r.actual, r.budget),
    achievementPercent: achievementPercent(r.actual, r.budget),
  }));
}

function buildAlerts(): FinancialAlert[] {
  return [
    { id: 'a1', title: 'فروش زیر قیمت تمام‌شده', description: 'سفارش ORD-1031 با حاشیه منفی ۲٪', severity: 'critical', category: 'فروش', createdAt: '1404/10/12' },
    { id: 'a2', title: 'مشتری معوق', description: 'توسعه بتن کیش — ۳۷۰ میلیون معوق', severity: 'high', category: 'مطالبات', createdAt: '1404/10/11' },
    { id: 'a3', title: 'افزایش قیمت سیمان', description: '۶.۵٪ افزایش نسبت به ماه قبل', severity: 'medium', category: 'مواد', createdAt: '1404/10/10' },
    { id: 'a4', title: 'تحویل فاکتورنشده', description: '۱۲ سفارش تحویل‌شده بدون فاکتور', severity: 'high', category: 'فاکتور', createdAt: '1404/10/09' },
    { id: 'a5', title: 'کسری نقدینگی', description: 'پیش‌بینی کسری ۴۵۰ میلیون در ۷ روز آینده', severity: 'critical', category: 'نقدینگی', createdAt: '1404/10/08' },
    { id: 'a6', title: 'موجودی بحرانی سیمان', description: 'موجودی کمتر از حداقل ۲۰۰ تن', severity: 'high', category: 'انبار', createdAt: '1404/10/07' },
    { id: 'a7', title: 'پروژه زیان‌ده', description: 'مجتمع تجاری نور — حاشیه ۴٪-', severity: 'high', category: 'پروژه', createdAt: '1404/10/06' },
  ];
}

export const FINANCIAL_MOCK = {
  plants: buildPlants(),
  concreteCosts: buildConcreteCosts(),
  receivables: buildReceivables(),
  payables: buildPayables(),
  materials: buildMaterials(),
  fleet: buildFleet(),
  profitability: buildProfitability(),
  contracts: buildContracts(),
  invoices: buildInvoices(),
  inventory: buildInventory(),
  budget: buildBudget(),
  alerts: buildAlerts(),
  salesByDay: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].map((d, i) => ({
    day: d,
    amount: 1_100_000_000 + i * 180_000_000,
  })),
  cashIn: [820, 940, 880, 1020, 960, 1100, 890],
  cashOut: [640, 720, 810, 780, 850, 920, 760],
};
