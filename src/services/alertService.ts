import { collection, doc, updateDoc, onSnapshot, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { StockoutAlert } from "../types";

/**
 * FR6/FR7: alerts are written server-side by functions/src/onProductWrite.ts
 * whenever a product's currentQty crosses its reorderThreshold, and pushed
 * via functions/src/sendStockoutPush.ts. The client only reads/resolves them.
 */
export function subscribeToOpenAlerts(shopId: string, onChange: (alerts: StockoutAlert[]) => void) {
  const q = query(
    collection(db, "shops", shopId, "alerts"),
    where("status", "==", "open"),
    orderBy("triggeredAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        alertId: d.id,
        ...data,
        triggeredAt: (data.triggeredAt as Timestamp)?.toMillis?.() ?? data.triggeredAt,
      } as StockoutAlert;
    });
    onChange(alerts);
  });
}

export async function resolveAlert(shopId: string, alertId: string) {
  await updateDoc(doc(db, "shops", shopId, "alerts", alertId), { status: "resolved" });
}
