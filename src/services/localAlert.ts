import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

// Set once, when the file loads, so it is always in place before any alert.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureReady(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const request = await Notifications.requestPermissionsAsync();
  return request.status === "granted";
}

/**
 * Shows a low stock notification. If the phone blocks notifications or the
 * call fails, an in-app alert is shown instead so the owner still sees it.
 * Errors never affect the sale.
 */
export async function notifyLowStock(productName: string, remaining: number): Promise<void> {
  const title = remaining <= 0 ? "Out of stock" : "Low stock";
  const body =
    remaining <= 0
      ? `${productName} is finished. Please restock.`
      : `${productName} is running low, only ${remaining} left.`;

  try {
    console.log("[alert] notifyLowStock called:", productName, remaining);
    const ready = await ensureReady();
    console.log("[alert] permission granted:", ready);
    if (!ready) {
      Alert.alert(title, body);
      return;
    }
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
    console.log("[alert] scheduled:", id);
  } catch (err) {
    console.warn("Could not show the low stock notification.", err);
    Alert.alert(title, body);
  }
}