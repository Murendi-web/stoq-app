import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Remote push notifications were removed from Expo Go in SDK 53 — calling
// any expo-notifications API there (even just setNotificationHandler at
// import time) logs a warning on every single reload, and a real token can
// never come back. Skip the whole module's behaviour in Expo Go rather than
// let it warn repeatedly for a path that can't work until this is run as a
// development build (see README "Still to do").
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * FR7: requests notification permission, gets this device's native push
 * token, and writes it to shops/{shopId}/deviceTokens/{token} so the
 * sendStockoutPush Cloud Function (functions/src/sendStockoutPush.ts) has
 * somewhere to deliver alerts to. Uses the native FCM/APNs token (not the
 * Expo push token) because the Cloud Function calls admin.messaging()
 * directly — that requires a real device or a development build, it will
 * not return a usable token on the iOS Simulator.
 *
 * Call this once after login/registration succeeds (see AuthContext).
 */
export async function registerForPushNotifications(shopId: string): Promise<string | null> {
  if (isExpoGo) {
    console.log("Stoq: running in Expo Go, so stockout push notifications are skipped — use a development build to test them.");
    return null;
  }
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device — skipping registration.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn("Push notification permission was not granted.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("stockout-alerts", {
      name: "Stockout Alerts",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const tokenResponse = await Notifications.getDevicePushTokenAsync();
  const token = tokenResponse.data;

  await setDoc(doc(db, "shops", shopId, "deviceTokens", token), {
    platform: Platform.OS,
    registeredAt: serverTimestamp(),
  });

  return token;
}

/** Call on logout so a shared/borrowed device stops receiving this shop's alerts. */
export async function unregisterPushToken(shopId: string, token: string): Promise<void> {
  await deleteDoc(doc(db, "shops", shopId, "deviceTokens", token));
}