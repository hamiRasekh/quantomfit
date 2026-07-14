/** Mirrors backend FinancialAggregateDto — live data from orders, materials, inventory. */

export type FinancialAggregate = {
  overview: {
    salesToday: number;
    salesMonth: number;
    salesRange: number;
    grossRevenue: number;
    directCosts: number;
    totalReceivables: number;
    overdueReceivables: number;
    totalPayables: number;
    uninvoicedOrders: number;
    lossMakingOrders: number;
    totalVolumeM3: number;
  };
  plants: Array<{
    plantId: string;
    plantName: string;
    revenue: number;
    materialCost: number;
    productionCost: number;
    transportCost: number;
    pumpCost: number;
    overheadCost: number;
    volumeM3: number;
  }>;
  salesByDay: Array<{ day: string; amount: number }>;
  profitByDay: Array<{ label: string; profit: number }>;
  profitByMonth: Array<{ label: string; profit: number }>;
  salesByCustomer: Array<{
    customerId: string;
    customerName: string;
    revenue: number;
    volumeM3: number;
    orderCount: number;
  }>;
  salesByProduct: Array<{
    productId: string;
    productName: string;
    grade: string | null;
    revenue: number;
    quantity: number;
  }>;
  concreteCosts: Array<{
    grade: string;
    mixCode: string;
    sellingPricePerM3: number;
    cementCost: number;
    sandCost: number;
    gravelCost: number;
    admixtureCost: number;
    waterCost: number;
    otherMaterialCost: number;
    productionCost: number;
    transportCost: number;
    pumpCost: number;
    overheadCost: number;
    wasteCost: number;
    totalCostPerM3: number;
    profitPerM3: number;
    marginPercent: number;
    volumeM3: number;
    aiStandardCostPerM3?: number;
  }>;
  receivables: Array<{
    customerId: string;
    customerName: string;
    totalReceivable: number;
    current: number;
    overdue: number;
    aging0_30: number;
    aging31_60: number;
    aging61_90: number;
    aging90Plus: number;
    creditLimit: number;
    creditBalance: number;
    dsoDays: number;
    checksPending: number;
  }>;
  payables: Array<{
    supplierId: string;
    supplierName: string;
    category: string;
    totalPayable: number;
    dueThisWeek: number;
    unpaidInvoices: number;
    avgUnitPrice: number;
  }>;
  materials: Array<{
    materialKey: string;
    materialName: string;
    consumedQty: number;
    consumedAmount: number;
    avgPurchasePrice: number;
    stockQty: number;
    stockValue: number;
    variancePercent: number;
    wastePercent: number;
    priceTrendPercent: number;
    profitImpactPerM3: number;
  }>;
  inventory: Array<{
    materialName: string;
    quantity: number;
    unit: string;
    value: number;
    turnoverDays: number;
    minStock: number;
    isCritical: boolean;
    varianceQty: number;
  }>;
  profitability: Array<{
    entityId: string;
    entityName: string;
    entityType: 'customer' | 'project';
    volumeM3: number;
    revenue: number;
    avgSellingPrice: number;
    actualCost: number;
    grossProfit: number;
    marginPercent: number;
    balanceDue: number;
    paymentStatus: string;
    orderCount: number;
    returnM3: number;
    discountAmount: number;
    rank?: number;
  }>;
  contracts: Array<{
    id: string;
    title: string;
    type: 'quote' | 'contract' | 'order';
    amount: number;
    status: string;
    risk: 'low' | 'medium' | 'high';
    marginPercent?: number;
    creditRisk?: boolean;
  }>;
  invoices: Array<{
    id: string;
    orderNo: string;
    customerName: string;
    deliveredM3: number;
    invoicedM3: number;
    varianceM3: number;
    invoicedAmount: number;
    paidAmount: number;
    returnM3: number;
    status: string;
  }>;
  budget: Array<{
    category: string;
    budget: number;
    actual: number;
    variance: number;
    variancePercent: number;
    achievementPercent: number;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    createdAt: string;
  }>;
  cashFlow: {
    bankBalance: number;
    cashBalance: number;
    inToday: number;
    outToday: number;
    inWeek: number;
    outWeek: number;
    inMonth: number;
    outMonth: number;
    forecast7: number;
    forecast30: number;
    cashInSeries: number[];
    cashOutSeries: number[];
    dayLabels: string[];
  };
  fleet: Array<{
    vehicleId: string;
    vehicleName: string;
    fuelCost: number;
    maintenanceCost: number;
    driverCost: number;
    depreciationCost: number;
    trips: number;
    volumeM3: number;
    costPerM3: number;
    costPerKm: number;
    returnConcreteM3: number;
  }>;
  meta: {
    fromDate: string;
    toDate: string;
    orderCount: number;
    dataSource: 'live';
  };
};
