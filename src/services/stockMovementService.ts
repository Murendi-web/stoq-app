import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { StockMovement, StockMovementType } from "../types";

/**
 * FR4: records a restock/adjustment and updates the product's currentQty
 * atomically, mirroring the approach in saleService.logSale.
 */
export async function recordStockMovement(params: {
  shopId: string;
  productId: string;
  type: StockMovementType;
  quantityChanged: number; // positive for restock; +/- for a manual adjustment
  loggedByUserId: string;
}): Promise<string> {
  const { shopId, productId, type, quantityChanged, loggedByUserId } = params;
  const movementRef = doc(collection(db, "shops", shopId, "stockMovements"));
  const productRef = doc(db, "shops", shopId, "products", productId);

  await runTransaction(db, async (tx) => {
    const productSnap = await tx.get(productRef);
    if (!productSnap.exists()) throw new Error("Product no longer exists.");
    const currentQty = productSnap.data().currentQty as number;

    const movement: Omit<StockMovement, "movementId"> = {
      shopId,
      productId,
      type,
      quantityChanged,
      timestamp: Date.now(),
      loggedByUserId,
    };
    tx.set(movementRef, { ...movement, timestamp: Timestamp.now() });
    tx.update(productRef, { currentQty: currentQty + quantityChanged });
  });

  return movementRef.id;
}
