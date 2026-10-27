import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * FR7: when onProductWrite (onProductWrite.ts) creates a new open alert,
 * push a notification to every device token registered for this shop's
 * owner. Device tokens are expected to be written to
 * shops/{shopId}/deviceTokens/{token} by the client after FCM registration

 */
export const sendStockoutPush = functions.firestore
  .document("shops/{shopId}/alerts/{alertId}")
  .onCreate(async (snapshot, context) => {
    const { shopId } = context.params;
    const alert = snapshot.data() as { productName: string };

    const tokensSnap = await db.collection("shops").doc(shopId).collection("deviceTokens").get();
    const tokens = tokensSnap.docs.map((d) => d.id);
    if (tokens.length === 0) return;

    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: "Low stock alert",
        body: `${alert.productName} has reached its reorder threshold.`,
      },
      data: { alertId: context.params.alertId, type: "STOCKOUT_ALERT" },
    });
  });
