export enum StockLedgerType {
  IN = 'IN',
  OUT = 'OUT',
}

export interface StockLedger {
  id: string;
  rawMaterialId: string;
  type: StockLedgerType;
  quantity: number;
  unitPrice?: number;
  party?: string;
  note?: string;
  occurredAt: string;
  source?: string;
  purchaseInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  rawMaterial?: {
    id: string;
    name: string;
    code: string;
    unit?: {
      id: string;
      name: string;
    };
  };
}

export interface CreateLedgerEntryDto {
  rawMaterialId: string;
  type: StockLedgerType;
  quantity: number;
  unitPrice?: number;
  occurredAt: string;
  party?: string;
  note?: string;
}

export interface StockLedgerListParams {
  page?: number;
  limit?: number;
  rawMaterialId?: string;
  type?: StockLedgerType;
  fromDate?: string;
  toDate?: string;
}




