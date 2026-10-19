import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { subscribeToSales } from "../../services/saleService";
import { subscribeToProducts } from "../../services/productService";
import { BarChart } from "../../components/BarChart";
import { colors } from "../../theme/colors";
import { Product, Sale } from "../../types";

type RangeOption = "today" | "week";

function startOf(range: RangeOption) {
  const d = new Date();
  if (range === "today") {
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(d.getDate() - 7);
  }
  return d.getTime();
}

export default function SalesReportScreen() {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeOption>("today");
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToProducts(user.shopId, setProducts);
  }, [user?.shopId]);

  useEffect(() => {
    if (!user) return;
    return subscribeToSales(user.shopId, startOf(range), setSales);
  }, [user?.shopId, range]);

  const productName = (id: string) => products.find((p) => p.productId === id)?.name ?? "Unknown product";

  const byProduct = useMemo(() => {
    const totals = new Map<string, { qty: number; revenue: number }>();
    for (const s of sales) {
      const existing = totals.get(s.productId) ?? { qty: 0, revenue: 0 };
      existing.qty += s.quantitySold;
      existing.revenue += s.quantitySold * s.unitPrice;
      totals.set(s.productId, existing);
    }
    return Array.from(totals.entries())
      .map(([productId, t]) => ({ productId, ...t }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  const chartData = useMemo(
    () =>
      [...byProduct]
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)
        .map((item) => ({ label: productName(item.productId), value: item.qty })),
    [byProduct, products]
  );

  const grandTotal = sales.reduce((sum, s) => sum + s.quantitySold * s.unitPrice, 0);

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, range === "today" && styles.toggleActive]}
          onPress={() => setRange("today")}
        >
          <Text style={[styles.toggleText, range === "today" && styles.toggleTextActive]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, range === "week" && styles.toggleActive]}
          onPress={() => setRange("week")}
        >
          <Text style={[styles.toggleText, range === "week" && styles.toggleTextActive]}>Last 7 Days</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>Total Sales</Text>
        <Text style={styles.totalValue}>R {grandTotal.toFixed(2)}</Text>
      </View>

      <FlatList
        data={byProduct}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          chartData.length > 0 ? (
            <View style={styles.chartBlock}>
              <Text style={styles.chartTitle}>Top Products by Quantity Sold</Text>
              <BarChart data={chartData} valueFormatter={(v) => `${v} sold`} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowName}>{productName(item.productId)}</Text>
            <Text style={styles.rowMeta}>{item.qty} sold · R {item.revenue.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No sales in this period.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toggleRow: { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 0 },
  toggle: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center", backgroundColor: colors.backgroundMuted },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  toggleTextActive: { color: "#fff" },
  totalBanner: { margin: 16, padding: 16, backgroundColor: colors.primaryLight, borderRadius: 10 },
  totalLabel: { fontSize: 12, color: colors.primary },
  totalValue: { fontSize: 24, fontWeight: "800", color: colors.primary, marginTop: 4 },
  chartBlock: { marginBottom: 20 },
  chartTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowName: { fontWeight: "600", color: colors.text },
  rowMeta: { color: colors.muted, fontSize: 12 },
  emptyText: { textAlign: "center", color: colors.muted, marginTop: 40 },
});