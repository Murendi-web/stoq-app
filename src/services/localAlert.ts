import * as Notifications from "expo-notifications";

let handlerSet = false;

/** Sets up the display handler once and asks for permission the first time. */
async function ensureReady(): Promise<boolean> {
  if (!handlerSet) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerSet = true;
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const request = await Notifications.requestPermissionsAsync();
  return request.status === "granted";
}

/**
 * Fires an immediate local notification. A failure here must never affect
 * the sale, so every error is caught and logged.
 */
export async function notifyLowStock(productName: string, remaining: number): Promise<void> {
  try {
    console.log("[alert] notifyLowStock called");
    const ready = await ensureReady();
    console.log("[alert] permission granted:", ready);
    if (!ready) return;
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: "Low stock", body: `${productName} is down to ${remaining}.` },
      trigger: null,
    });
    console.log("[alert] scheduled:", id);
  } catch (err) {
    console.warn("Could not show the low stock notification.", err);
  }
}