import {
  collection,
  doc,
  runTransaction,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Sale } from "../types";
import { notifyLowStock } from "./localAlert";

/**
 * FR3: logs a sale and lowers the product's currentQty in one Firestore
 * transaction, so the two writes cannot drift apart. After the transaction
 * commits, a local notification fires if this sale took stock to or below
 * the reorder threshold.
 */
export async function logSale(params: {
  shopId: string;
  productId: string;
  quantitySold: number;
  unitPrice: number;
  loggedByUserId: string;
}): Promise<string> {
  const { shopId, productId, quantitySold, unitPrice, loggedByUserId } = params;
  const saleRef = doc(collection(db, "shops", shopId, "sales"));
  const productRef = doc(db, "shops", shopId, "products", productId);

  let before = 0;
  let remaining = 0;
  let threshold = 0;
  let productName = "";

  await runTransaction(db, async (tx) => {
    const productSnap = await tx.get(productRef);
    if (!productSnap.exists()) throw new Error("Product no longer exists.");
    const data = productSnap.data();
    const currentQty = data.currentQty as number;
    if (currentQty < quantitySold) {
      throw new Error(`Only ${currentQty} left in stock.`);
    }

    // Reassigned on every run, because Firestore may retry this callback.
    before = currentQty;
    remaining = currentQty - quantitySold;
    threshold = Number(data.reorderThreshold);
    productName = String(data.name ?? "Product");

    const sale: Omit<Sale, "saleId"> = {
      shopId,
      productId,
      quantitySold,
      unitPrice,
      timestamp: Date.now(),
      loggedByUserId,
    };
    tx.set(saleRef, { ...sale, timestamp: Timestamp.now() });
    tx.update(productRef, { currentQty: remaining });
  });

  console.log("[sale] before:", before, "remaining:", remaining, "threshold:", threshold, "name:", productName);

  if (before > threshold && remaining <= threshold) {
    console.log("[sale] threshold crossed, calling notifyLowStock");
    notifyLowStock(productName, remaining);
  }

  return saleRef.id;
}

/** FR8: basic sales report. Subscribes to sales within a date range for one shop. */
export function subscribeToSales(
  shopId: string,
  sinceMillis: number,
  onChange: (sales: Sale[]) => void
) {
  const q = query(
    collection(db, "shops", shopId, "sales"),
    where("timestamp", ">=", Timestamp.fromMillis(sinceMillis)),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const sales = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        saleId: d.id,
        ...data,
        timestamp: (data.timestamp as Timestamp)?.toMillis?.() ?? data.timestamp,
      } as Sale;
    });
    onChange(sales);
  });
}