export type MaterialPurchaseInvoiceLine = {
  id: string;
  rawMaterialId: string;
  quantity: number;
  unitPrice?: number;
  rawMaterial?: {
    id: string;
    name: string;
    code: string;
    unit?: { id: string; name: string };
  };
};

export type MaterialPurchaseInvoice = {
  id: string;
  invoiceNumber?: string;
  party: string;
  invoiceDate: string;
  description?: string;
  fileName?: string;
  originalFileName?: string;
  mimeType?: string;
  fileSize?: number;
  totalAmount: number;
  lines: MaterialPurchaseInvoiceLine[];
  createdAt: string;
};

export type CreateMaterialPurchaseInvoiceLine = {
  rawMaterialId: string;
  quantity: number;
  unitPrice: number;
};

export type CreateMaterialPurchaseInvoicePayload = {
  invoiceNumber?: string;
  party: string;
  invoiceDate: string;
  description?: string;
  lines: CreateMaterialPurchaseInvoiceLine[];
  invoiceFile?: File | null;
};
