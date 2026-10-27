// Core domain types — mirror the ER model in Deliverable 3 (Section 7: Data Design).
// Firestore paths are documented next to each type so services/ stay easy to trace
// back to the data design.

export type UserRole = "owner" | "staff";

/** users/{userId} */
export interface AppUser {
  userId: string;
  shopId: string;
  name: string;
  email: string;
  role: UserRole;
}

/** shops/{shopId} */
export interface Shop {
  shopId: string;
  shopName: string;
  address?: string;
  ownerId: string;
}

/** shops/{shopId}/products/{productId} */
export interface Product {
  productId: string;
  shopId: string;
  name: string;
  category?: string;
  brand?: string;
  barcode?: string;
  unitPrice: number;
  currentQty: number;
  reorderThreshold: number;
  supplierId?: string | null;
}

/** shops/{shopId}/sales/{saleId} */
export interface Sale {
  saleId: string;
  shopId: string;
  productId: string;
  quantitySold: number;
  unitPrice: number;
  timestamp: number;
  loggedByUserId: string;
}

export type StockMovementType = "restock" | "adjustment";

/** shops/{shopId}/stockMovements/{movementId} */
export interface StockMovement {
  movementId: string;
  shopId: string;
  productId: string;
  type: StockMovementType;
  quantityChanged: number;
  timestamp: number;
  loggedByUserId: string;
}

/** shops/{shopId}/suppliers/{supplierId} */
export interface Supplier {
  supplierId: string;
  shopId: string;
  name: string;
  contactNumber?: string;
}

export type AlertStatus = "open" | "resolved";

/** shops/{shopId}/alerts/{alertId} */
export interface StockoutAlert {
  alertId: string;
  shopId: string;
  productId: string;
  productName: string;
  triggeredAt: number;
  status: AlertStatus;
}

export type QueuedActionType = "LOG_SALE" | "RECORD_RESTOCK";

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  payload: Record<string, unknown>;
  createdAt: number;
}