import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { subscribeToOpenAlerts, resolveAlert } from "../../services/alertService";
import { StockoutAlert } from "../../types";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 22 }: { name: IconName; size?: number }) => (
  <Ionicons name={name} size={size} color={theme.black} />
);

const border = {
  borderWidth: 2,
  borderColor: theme.black,
} as const;

export default function AlertsScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<StockoutAlert[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.shopId) {
      setAlerts([]);
      return;
    }
    return subscribeToOpenAlerts(user.shopId, setAlerts);
  }, [user?.shopId]);

  const formatDate = (value: StockoutAlert["triggeredAt"]) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Date unavailable"
      : date.toLocaleString();
  };

  const handleResolve = (item: StockoutAlert) => {
    if (!user || resolvingId) return;

    Alert.alert(
      "Mark as Reordered?",
      `Confirm that you've reordered "${item.productName}". This will close the alert.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setResolvingId(item.alertId);
            try {
              await resolveAlert(user.shopId, item.alertId);
            } catch (error: any) {
              Alert.alert(
                "Could not update alert",
                error?.message ?? "Please try again."
              );
            } finally {
              setResolvingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={c.screen}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.alertId}
        contentContainerStyle={[c.content, { flexGrow: 1 }]}
        ListHeaderComponent={
          <>
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.eyebrow}>STOQ INVENTORY</Text>
                <Text style={c.heading}>Stock Alerts</Text>
                <Text style={c.subtitle}>
                  Stay ahead of stock shortages.
                </Text>
              </View>
              <View style={[c.iconBox, s.headerIcon]}>
                <Icon name="notifications-outline" size={28} />
              </View>
            </View>

            <View style={[c.card, c.shadow, s.summary]}>
              <View style={s.rowBetween}>
                <View style={[c.iconBox, s.summaryIcon]}>
                  <Icon
                    name={alerts.length
                      ? "warning-outline"
                      : "checkmark-circle-outline"}
                    size={28}
                  />
                </View>
                <Text style={s.badge}>
                  {alerts.length ? "NEEDS ATTENTION" : "ALL CLEAR"}
                </Text>
              </View>

              <Text style={s.count}>{alerts.length}</Text>
              <Text style={s.summaryTitle}>
                {alerts.length === 1
                  ? "Open Stock Alert"
                  : "Open Stock Alerts"}
              </Text>
              <Text style={s.description}>
                {alerts.length
                  ? "Review these products and arrange restocking."
                  : "Great work! There are no open stockout alerts."}
              </Text>
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>
                {alerts.length ? "Needs Attention" : "Inventory Status"}
              </Text>
              <Text
                style={[
                  s.badge,
                  {
                    backgroundColor: alerts.length
                      ? theme.pink
                      : theme.green,
                  },
                ]}
              >
                {alerts.length}
              </Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          const busy = resolvingId === item.alertId;

          return (
            <View style={[c.card, s.alertCard]}>
              <View style={s.productRow}>
                <View
                  style={[
                    c.iconBox,
                    s.productIcon,
                    {
                      backgroundColor:
                        index % 2 ? theme.yellow : theme.pink,
                    },
                  ]}
                >
                  <Icon name="cube-outline" size={25} />
                </View>

                <View style={{ flex: 1, alignItems: "flex-start" }}>
                  <Text style={s.productName} numberOfLines={2}>
                    {item.productName}
                  </Text>
                  <Text style={[s.badge, { backgroundColor: theme.pink }]}>
                    STOCK ALERT
                  </Text>
                </View>
              </View>

              <View style={s.divider} />

              <View style={s.dateRow}>
                <Ionicons
                  name="time-outline"
                  size={17}
                  color={theme.muted}
                />
                <Text style={c.subtitle}>
                  Triggered {formatDate(item.triggeredAt)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  c.button,
                  s.resolveButton,
                  resolvingId !== null && { opacity: 0.55 },
                ]}
                onPress={() => handleResolve(item)}
                disabled={resolvingId !== null}
              >
                {busy ? (
                  <ActivityIndicator color={theme.black} />
                ) : (
                  <Icon name="checkmark-circle-outline" />
                )}
                <Text style={c.buttonText}>
                  {busy ? "Updating..." : "Mark as Reordered"}
                </Text>
                {!busy && <Icon name="arrow-forward" size={20} />}
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={[c.iconBox, s.emptyIcon]}>
              <Icon name="checkmark-done-outline" size={40} />
            </View>
            <Text style={s.emptyTitle}>
              You're All Caught Up!
            </Text>
            <Text style={s.emptyText}>
              No open stockout alerts right now.
              Keep your inventory updated to stay
              on top of stock levels.
            </Text>
            <Text style={[s.badge, { backgroundColor: theme.green }]}>
              ALL CLEAR
            </Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginTop: 8, marginBottom: 26,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900", letterSpacing: 1.5,
    color: theme.muted, marginBottom: 5,
  },
  headerIcon: {
    width: 56, height: 56, backgroundColor: theme.purple,
    borderWidth: 2.5, borderRadius: 14,
  },
  summary: {
    backgroundColor: theme.yellow, marginBottom: 30,
    borderRadius: 16, padding: 19,
  },
  rowBetween: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  summaryIcon: {
    width: 49, height: 49, backgroundColor: theme.white,
    borderRadius: 12,
  },
  badge: {
    ...border, backgroundColor: theme.white,
    borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 7, fontSize: 10,
    fontWeight: "900", color: theme.black,
    overflow: "hidden",
  },
  count: {
    fontSize: 48, fontWeight: "900",
    color: theme.black, marginTop: 15,
  },
  summaryTitle: {
    fontSize: 19, fontWeight: "900", color: theme.black,
  },
  description: {
    fontSize: 12, color: theme.black,
    lineHeight: 18, marginTop: 8,
  },
  section: {
    flexDirection: "row", alignItems: "center",
    gap: 10, marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 21, fontWeight: "900", color: theme.black,
  },
  alertCard: {
    padding: 16, borderWidth: 2, marginBottom: 16,
  },
  productRow: {
    flexDirection: "row", alignItems: "center", gap: 13,
  },
  productIcon: {
    width: 54, height: 54, borderRadius: 12,
  },
  productName: {
    fontSize: 17, fontWeight: "900",
    color: theme.black, marginBottom: 8,
  },
  divider: {
    height: 2, backgroundColor: theme.black,
    marginVertical: 15,
  },
  dateRow: {
    flexDirection: "row", alignItems: "center",
    gap: 7, marginBottom: 17,
  },
  resolveButton: {
    borderWidth: 2, borderRadius: 11,
    paddingVertical: 13, paddingHorizontal: 12,
    shadowOpacity: 0, elevation: 0,
  },
  empty: {
    backgroundColor: theme.white, ...border,
    borderStyle: "dashed", borderRadius: 16,
    padding: 27, alignItems: "center",
  },
  emptyIcon: {
    width: 80, height: 80, backgroundColor: theme.green,
    borderRadius: 20,
  },
  emptyTitle: {
    fontSize: 20, fontWeight: "900",
    color: theme.black, marginTop: 18,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 12, color: theme.muted, lineHeight: 19,
    textAlign: "center", marginTop: 10, marginBottom: 20,
  },
});
