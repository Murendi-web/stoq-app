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

/**
 * FR3: logs a sale and decrements the matching product's currentQty in a
 * single Firestore transaction, so the two writes can never drift apart
 * (e.g. app crashing between the two calls). The stockout-alert Cloud
 * Function (functions/src/onProductWrite.ts) then reacts to the resulting
 * product write — this function does not raise alerts itself.
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

  await runTransaction(db, async (tx) => {
    const productSnap = await tx.get(productRef);
    if (!productSnap.exists()) throw new Error("Product no longer exists.");
    const currentQty = productSnap.data().currentQty as number;
    if (currentQty < quantitySold) {
      throw new Error(`Only ${currentQty} left in stock.`);
    }

    const sale: Omit<Sale, "saleId"> = {
      shopId,
      productId,
      quantitySold,
      unitPrice,
      timestamp: Date.now(),
      loggedByUserId,
    };
    tx.set(saleRef, { ...sale, timestamp: Timestamp.now() });
    tx.update(productRef, { currentQty: currentQty - quantitySold });
  });

  return saleRef.id;
}

/** FR8: basic sales report — subscribes to sales within a date range for one shop. */
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
