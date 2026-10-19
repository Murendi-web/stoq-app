import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * FR6: whenever a product document is written (sale, restock, edit), check
 * whether currentQty has crossed reorderThreshold and, if so, open a
 * StockoutAlert document. Idempotent: it won't create a second open alert
 * for the same product if one is already open.
 *
 * This is deliberately a pure "reaction" to product writes rather than being
 * triggered from saleService/stockMovementService directly — that keeps the
 * alert logic correct regardless of which client (owner's phone, staff
 * phone, or a future admin console) performed the write.
 */
export const onProductWrite = functions.firestore
  .document("shops/{shopId}/products/{productId}")
  .onWrite(async (change, context) => {
    const { shopId, productId } = context.params;
    if (!change.after.exists) return; // product deleted — nothing to alert on

    const product = change.after.data() as {
      name: string;
      currentQty: number;
      reorderThreshold: number;
    };

    const isLow = product.currentQty <= product.reorderThreshold;
    const alertsRef = db.collection("shops").doc(shopId).collection("alerts");
    const existingOpenAlert = await alertsRef
      .where("productId", "==", productId)
      .where("status", "==", "open")
      .limit(1)
      .get();

    if (isLow && existingOpenAlert.empty) {
      await alertsRef.add({
        productId,
        productName: product.name,
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "open",
      });
    }

    if (!isLow && !existingOpenAlert.empty) {
      // Product was restocked above threshold — auto-resolve any open alert.
      await existingOpenAlert.docs[0].ref.update({ status: "resolved" });
    }
  });
