export type OrderProcessTableRow = {
  id?: string;
  itemId: string;
  orderId: string;
  orderNumber: string;
  orderCreatedAt: string | Date;
  productName: string;
  productId?: string;
  sku: string;
  coverUrl?: string;
  quantity: number;
  price: number;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl?: string;
  orderStatus: string;
  statusRoadmap?: any[];
  size?: string;
  deliveryMethod?: string;
  orderDiscount?: number;
  orderTotalAmount?: number;
  orderSubtotal?: number;
  orderShipping?: number;
  orderTaxes?: number;
  orderTrackingNumber?: string;
  orderPayment?: {
    cardType?: string;
    cardNumber?: string;
  };
  shippingAddress?: {
    fullAddress?: string;
    phoneNumber?: string;
  };
  customerNotes?: string;
  orderNotes?: string;
  canvasPreview?: {
    canvasId?: string | number;
    screenshots?: string[];
    snapshotUrl?: string;
  };
};

export type OrderNote = {
  id: string;
  orderId: string;
  itemId?: string;
  note: string;
  content?: string;
  createdAt: string | Date;
  created_at?: string | Date;
  createdBy?: string;
  admin_name?: string;
  admin_username?: string;
  mentioned_admins?: Array<{ id: string; username?: string; name?: string }>;
  mentioned_items?: Array<{ id: string; name?: string; sku?: string }>;
  files?: Array<{ id: string; name: string; url: string; type: string }>;
  show_to_customer?: boolean;
};

export type CreateOrderNoteData = {
  orderId: string;
  order_id?: string;
  itemId?: string;
  item_id?: string;
  note: string;
  content?: string;
  mentioned_admin_ids?: string[];
  mentioned_item_ids?: string[];
  files?: File[];
  file_types?: string[];
  show_to_customer?: boolean;
};

