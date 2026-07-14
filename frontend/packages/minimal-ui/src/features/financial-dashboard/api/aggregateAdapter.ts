import { FinancialAggregate } from '../types/aggregate';
import {
  BudgetVariance,
  ConcreteCostBreakdown,
  ContractFinancialStatus,
  CustomerReceivable,
  FinancialAlert,
  InvoiceReconciliation,
  InventoryValuation,
  FleetCostItem,
  MaterialCostItem,
  PlantProfitability,
  ProjectProfitability,
  SupplierPayable,
} from '../types';

/** Shape compatible with existing page builder (formerly FINANCIAL_MOCK). */
export type FinancialDataset = {
  overview?: FinancialAggregate['overview'];
  plants: PlantProfitability[];
  concreteCosts: ConcreteCostBreakdown[];
  receivables: CustomerReceivable[];
  payables: SupplierPayable[];
  materials: MaterialCostItem[];
  fleet: FleetCostItem[];
  profitability: ProjectProfitability[];
  contracts: ContractFinancialStatus[];
  invoices: InvoiceReconciliation[];
  inventory: InventoryValuation[];
  budget: BudgetVariance[];
  alerts: FinancialAlert[];
  salesByDay: Array<{ day: string; amount: number }>;
  cashIn: number[];
  cashOut: number[];
  cashFlow?: FinancialAggregate['cashFlow'];
  salesByCustomer?: FinancialAggregate['salesByCustomer'];
  salesByProduct?: FinancialAggregate['salesByProduct'];
};

export function aggregateToDataset(aggregate: FinancialAggregate): FinancialDataset {
  return {
    overview: aggregate.overview,
    plants: aggregate.plants.map((p) => ({
      plantId: p.plantId,
      plantName: p.plantName,
      revenue: p.revenue,
      materialCost: p.materialCost,
      productionCost: p.productionCost,
      transportCost: p.transportCost,
      pumpCost: p.pumpCost,
      overheadCost: p.overheadCost,
      volumeM3: p.volumeM3,
    })),
    concreteCosts: aggregate.concreteCosts.map((c) => ({
      grade: c.grade,
      mixCode: c.mixCode,
      sellingPricePerM3: c.sellingPricePerM3,
      cementCost: c.cementCost,
      sandCost: c.sandCost,
      gravelCost: c.gravelCost,
      admixtureCost: c.admixtureCost,
      waterCost: c.waterCost,
      otherMaterialCost: c.otherMaterialCost,
      productionCost: c.productionCost,
      transportCost: c.transportCost,
      pumpCost: c.pumpCost,
      overheadCost: c.overheadCost,
      wasteCost: c.wasteCost,
      totalCostPerM3: c.totalCostPerM3,
      profitPerM3: c.profitPerM3,
      marginPercent: c.marginPercent,
      volumeM3: c.volumeM3,
      aiStandardCostPerM3: c.aiStandardCostPerM3,
    })),
    receivables: aggregate.receivables,
    payables: aggregate.payables,
    materials: aggregate.materials,
    fleet: aggregate.fleet?.map((f) => ({
      vehicleId: f.vehicleId,
      vehicleName: f.vehicleName,
      fuelCost: f.fuelCost,
      maintenanceCost: f.maintenanceCost,
      driverCost: f.driverCost,
      depreciationCost: f.depreciationCost,
      trips: f.trips,
      volumeM3: f.volumeM3,
      costPerM3: f.costPerM3,
      costPerKm: f.costPerKm,
      returnConcreteM3: f.returnConcreteM3,
    })) ?? [],
    profitability: aggregate.profitability,
    contracts: aggregate.contracts,
    invoices: aggregate.invoices,
    inventory: aggregate.inventory,
    budget: aggregate.budget,
    alerts: aggregate.alerts,
    salesByDay: aggregate.salesByDay,
    cashIn: aggregate.cashFlow.cashInSeries,
    cashOut: aggregate.cashFlow.cashOutSeries,
    cashFlow: aggregate.cashFlow,
    salesByCustomer: aggregate.salesByCustomer,
    salesByProduct: aggregate.salesByProduct,
  };
}
