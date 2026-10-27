import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { subscribeToSales } from "../../services/saleService";
import { subscribeToProducts } from "../../services/productService";
import { BarChart } from "../../components/BarChart";
import { Product, Sale } from "../../types";
import { theme, commonStyles as c } from "../../theme/styles";

type Range = "today" | "week";
type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 23 }: {
  name: IconName; size?: number;
}) => <Ionicons name={name} size={size} color={theme.black} />;

const money = (n: number) => `R ${n.toFixed(2)}`;

const startOf = (range: Range) => {
  const d = new Date();
  if (range === "today") d.setHours(0, 0, 0, 0);
  else d.setDate(d.getDate() - 7);
  return d.getTime();
};

export default function SalesReportScreen() {
  const { user } = useAuth();
  const [range, setRange] = useState<Range>("today");
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user?.shopId) return;
    return subscribeToProducts(user.shopId, setProducts);
  }, [user?.shopId]);

  useEffect(() => {
    if (!user?.shopId) return;
    return subscribeToSales(user.shopId, startOf(range), setSales);
  }, [user?.shopId, range]);

  const names = useMemo(
    () => new Map(products.map((p) => [p.productId, p.name])),
    [products]
  );

  const breakdown = useMemo(() => {
    const totals = new Map<string, { qty: number; revenue: number }>();

    sales.forEach((sale) => {
      const item = totals.get(sale.productId) ?? { qty: 0, revenue: 0 };
      item.qty += sale.quantitySold;
      item.revenue += sale.quantitySold * sale.unitPrice;
      totals.set(sale.productId, item);
    });

    return [...totals].map(([productId, data]) => ({
      productId, ...data,
    })).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  const chartData = useMemo(
    () => [...breakdown]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((p) => ({
        label: names.get(p.productId) ?? "Unknown product",
        value: p.qty,
      })),
    [breakdown, names]
  );

  const revenue = sales.reduce(
    (sum, s) => sum + s.quantitySold * s.unitPrice, 0
  );
  const units = sales.reduce((sum, s) => sum + s.quantitySold, 0);
  const average = sales.length ? revenue / sales.length : 0;

  const stats: {
    label: string; value: number; icon: IconName; color: string;
  }[] = [
    { label: "Units Sold", value: units, icon: "bag-check-outline", color: theme.green },
    { label: "Sales Records", value: sales.length, icon: "receipt-outline", color: theme.purple },
  ];

  return (
    <View style={c.screen}>
      <FlatList
        data={breakdown}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={c.content}
        ListHeaderComponent={
          <>
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.eyebrow}>STOQ ANALYTICS</Text>
                <Text style={c.heading}>Sales Reports</Text>
                <Text style={c.subtitle}>
                  See how your shop is performing.
                </Text>
              </View>
              <View style={[c.iconBox, s.headerIcon]}>
                <Icon name="stats-chart-outline" size={28} />
              </View>
            </View>

            <Text style={s.section}>Select a period</Text>
            <View style={s.row}>
              {([
                { key: "today" as Range, label: "Today", icon: "today-outline" as IconName },
                { key: "week" as Range, label: "Last 7 Days", icon: "calendar-outline" as IconName },
              ]).map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[s.toggle, range === item.key && {
                    backgroundColor: theme.yellow,
                  }]}
                  onPress={() => setRange(item.key)}
                >
                  <Icon name={item.icon} size={18} />
                  <Text style={s.bold}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[c.card, c.shadow, s.revenue]}>
              <View style={s.between}>
                <Text style={s.eyebrow}>TOTAL REVENUE</Text>
                <Icon name="trending-up-outline" size={27} />
              </View>
              <Text
                style={s.revenueValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {money(revenue)}
              </Text>
              <Text style={s.small}>
                {range === "today"
                  ? "Sales recorded today"
                  : "Sales recorded over the last 7 days"}
              </Text>
            </View>

            <Text style={s.section}>At a glance</Text>
            <View style={s.row}>
              {stats.map((item) => (
                <View
                  key={item.label}
                  style={[c.card, s.stat, {
                    backgroundColor: item.color,
                  }]}
                >
                  <Icon name={item.icon} size={25} />
                  <Text style={s.statLabel}>{item.label}</Text>
                  <Text style={s.statValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            <View style={s.average}>
              <View style={[c.iconBox, { backgroundColor: theme.white }]}>
                <Icon name="calculator-outline" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.small}>Average per sales record</Text>
                <Text style={s.averageValue}>{money(average)}</Text>
              </View>
            </View>

            <Text style={s.section}>Top-selling products</Text>
            {chartData.length ? (
              <View style={c.card}>
                <View style={c.sectionHeading}>
                  <View style={[c.iconBox, { backgroundColor: theme.pink }]}>
                    <Icon name="bar-chart-outline" />
                  </View>
                  <View>
                    <Text style={c.sectionTitle}>Top 5 Products</Text>
                    <Text style={c.subtitle}>Ranked by quantity sold</Text>
                  </View>
                </View>
                <BarChart
                  data={chartData}
                  valueFormatter={(value) => `${value} sold`}
                />
              </View>
            ) : (
              <View style={s.empty}>
                <Icon name="bar-chart-outline" size={36} />
                <Text style={s.emptyTitle}>No chart data yet</Text>
                <Text style={c.subtitle}>
                  Log some sales to see your top products.
                </Text>
              </View>
            )}

            <View style={[s.row, { alignItems: "center", marginBottom: 14 }]}>
              <Text style={[s.section, { marginBottom: 0 }]}>
                Product breakdown
              </Text>
              <Text style={s.badge}>{breakdown.length}</Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <View style={s.productRow}>
            <View style={[c.iconBox, s.rank]}>
              <Text style={s.bold}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.productName} numberOfLines={2}>
                {names.get(item.productId) ?? "Unknown product"}
              </Text>
              <Text style={c.subtitle}>{item.qty} units sold</Text>
            </View>
            <Text style={s.productRevenue} numberOfLines={1}>
              {money(item.revenue)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Icon name="receipt-outline" size={36} />
            <Text style={s.emptyTitle}>No sales yet!</Text>
            <Text style={c.subtitle}>
              No sales have been recorded for this period.
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
    gap: 12, marginTop: 8, marginBottom: 28,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 1.5, color: theme.muted, marginBottom: 5,
  },
  headerIcon: {
    width: 56, height: 56, backgroundColor: theme.purple,
    borderWidth: 2.5, borderRadius: 14,
  },
  section: {
    fontSize: 20, fontWeight: "900",
    color: theme.black, marginBottom: 14,
  },
  row: {
    flexDirection: "row", gap: 12, marginBottom: 26,
  },
  between: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  toggle: {
    flex: 1, minHeight: 50, flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    gap: 7, borderWidth: 2, borderColor: theme.black,
    borderRadius: 12, backgroundColor: theme.white,
  },
  bold: { fontSize: 13, fontWeight: "900", color: theme.black },
  revenue: {
    backgroundColor: theme.yellow,
    padding: 22, marginBottom: 32,
  },
  revenueValue: {
    fontSize: 36, fontWeight: "900",
    color: theme.black, marginTop: 16,
  },
  small: {
    fontSize: 12, fontWeight: "600",
    color: theme.black, marginTop: 8,
  },
  stat: {
    flex: 1, minHeight: 145, padding: 15,
    justifyContent: "space-between", marginBottom: 0,
  },
  statLabel: {
    fontSize: 13, fontWeight: "800", color: theme.black,
  },
  statValue: {
    fontSize: 28, fontWeight: "900", color: theme.black,
  },
  average: {
    flexDirection: "row", alignItems: "center", gap: 13,
    borderWidth: 2, borderColor: theme.black,
    borderRadius: 14, backgroundColor: theme.blue,
    padding: 15, marginBottom: 32,
  },
  averageValue: {
    fontSize: 22, fontWeight: "900",
    color: theme.black, marginTop: 4,
  },
  empty: {
    ...c.card, borderWidth: 2,
    borderStyle: "dashed", alignItems: "center",
    padding: 28, marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 17, fontWeight: "900",
    color: theme.black, marginTop: 10,
  },
  badge: {
    backgroundColor: theme.purple, borderWidth: 2,
    borderColor: theme.black, borderRadius: 9,
    paddingHorizontal: 10, paddingVertical: 4,
    fontSize: 12, fontWeight: "900", overflow: "hidden",
  },
  productRow: {
    flexDirection: "row", alignItems: "center", gap: 11,
    padding: 13, backgroundColor: theme.white,
    borderWidth: 2, borderColor: theme.black,
    borderRadius: 12, marginBottom: 11,
  },
  rank: {
    width: 37, height: 37, backgroundColor: theme.green,
    borderRadius: 9,
  },
  productName: {
    fontSize: 13, fontWeight: "900", color: theme.black,
  },
  productRevenue: {
    fontSize: 14, fontWeight: "900",
    color: theme.black, maxWidth: "35%",
  },
});
