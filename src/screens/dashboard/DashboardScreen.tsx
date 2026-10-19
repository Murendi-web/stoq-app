import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { subscribeToProducts } from "../../services/productService";
import { subscribeToSales } from "../../services/saleService";
import { subscribeToOpenAlerts } from "../../services/alertService";
import { getShop } from "../../services/shopService";
import { AlertBanner } from "../../components/AlertBanner";
import { colors } from "../../theme/colors";
import { Product, Sale, StockoutAlert, Shop } from "../../types";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<StockoutAlert[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubProducts = subscribeToProducts(user.shopId, setProducts);
    const unsubSales = subscribeToSales(user.shopId, startOfToday(), setTodaySales);
    const unsubAlerts = subscribeToOpenAlerts(user.shopId, setAlerts);
    getShop(user.shopId).then(setShop);
    return () => {
      unsubProducts();
      unsubSales();
      unsubAlerts();
    };
  }, [user?.shopId]);

  const todayTotal = todaySales.reduce((sum, s) => sum + s.quantitySold * s.unitPrice, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.greetingBlock}>
        <Text style={styles.greetingText}>
          {greeting()}{user ? `, ${user.name.split(" ")[0]}` : ""}
        </Text>
        {shop && <Text style={styles.shopName}>{shop.shopName}</Text>}
      </View>

      <AlertBanner count={alerts.length} onPress={() => navigation.navigate("Alerts")} />

      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.cardLabel}>Today's Sales</Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>R {todayTotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.successLight }]}>
          <Text style={styles.cardLabel}>Products Tracked</Text>
          <Text style={[styles.cardValue, { color: colors.success }]}>{products.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("LogSale")}>
          <Text style={styles.actionButtonText}>+ Log a Sale</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Restock")}>
          <Text style={styles.actionButtonText}>+ Record Restock</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Sales</Text>
      {todaySales.slice(0, 5).map((s) => (
        <View key={s.saleId} style={styles.activityRow}>
          <Text style={styles.activityText}>
            Sold {s.quantitySold}x — R {(s.quantitySold * s.unitPrice).toFixed(2)}
          </Text>
        </View>
      ))}
      {todaySales.length === 0 && <Text style={styles.emptyText}>No sales logged yet today.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  greetingBlock: { marginBottom: 16 },
  greetingText: { fontSize: 20, fontWeight: "800", color: colors.text },
  shopName: { fontSize: 13, color: colors.muted, marginTop: 2 },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  card: { flex: 1, borderRadius: 10, padding: 14 },
  cardLabel: { fontSize: 12, color: colors.text },
  cardValue: { fontSize: 22, fontWeight: "800", marginTop: 6 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 8, marginTop: 4 },
  actionButton: { flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: "center" },
  actionButtonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  activityRow: { backgroundColor: colors.backgroundMuted, borderRadius: 6, padding: 10, marginBottom: 8 },
  activityText: { fontSize: 12, color: colors.text },
  emptyText: { fontSize: 12, color: colors.muted, fontStyle: "italic" },
});