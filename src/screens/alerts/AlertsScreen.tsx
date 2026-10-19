import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { subscribeToOpenAlerts, resolveAlert } from "../../services/alertService";
import { colors } from "../../theme/colors";
import { StockoutAlert } from "../../types";

export default function AlertsScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<StockoutAlert[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToOpenAlerts(user.shopId, setAlerts);
  }, [user?.shopId]);

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(a) => a.alertId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.productName}</Text>
            <Text style={styles.meta}>
              Triggered {new Date(item.triggeredAt).toLocaleString()}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => user && resolveAlert(user.shopId, item.alertId)}
            >
              <Text style={styles.buttonText}>MARK AS REORDERED</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No open stockout alerts. 🎉</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.warningLight,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  name: { fontWeight: "700", color: colors.warning, fontSize: 14 },
  meta: { color: colors.warning, fontSize: 12, marginTop: 4, marginBottom: 10 },
  button: { backgroundColor: colors.danger, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 11 },
  emptyText: { textAlign: "center", color: colors.muted, marginTop: 60 },
});
