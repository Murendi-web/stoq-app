import {
  collection,
  doc,
  runTransaction,
  setDoc,
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
 * transaction. After it commits, every sale that leaves stock at or below
 * the reorder threshold (a) writes/refreshes an open alert record, which the
 * Alerts screen and dashboard read, and (b) shows a phone notification.
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

  let remaining = 0;
  let threshold = 0;
  let productName = "";

  await runTransaction(db, async (tx) => {
    const productSnap = await tx.get(productRef);
    if (!productSnap.exists()) throw new Error("Product no longer exists.");
    const data = productSnap.data();
    const currentQty = Number(data.currentQty);
    if (currentQty < quantitySold) {
      throw new Error(`Only ${currentQty} left in stock.`);
    }

    // Reassigned on every run, because Firestore may retry this callback.
    remaining = currentQty - quantitySold;
    threshold = Number(data.reorderThreshold ?? data.reorderLevel ?? data.threshold ?? 0);
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

  console.log("[sale] remaining:", remaining, "threshold:", threshold, "name:", productName);

  if (remaining <= 0 || remaining <= threshold) {
    // 1. Alert record for the Alerts screen. One record per product (id = productId),
    //    refreshed on every low stock sale. Failure must never affect the sale.
    try {
      await setDoc(
        doc(db, "shops", shopId, "alerts", productId),
        {
          productId,
          productName,
          currentQty: remaining,
          triggeredAt: Timestamp.now(),
          status: "open",
        },
        { merge: true }
      );
      console.log("[sale] alert record saved");
    } catch (err) {
      console.warn("Could not save the alert record.", err);
    }

    // 2. Phone notification.
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