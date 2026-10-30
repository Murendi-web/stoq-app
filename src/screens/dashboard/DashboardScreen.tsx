import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { subscribeToProducts } from "../../services/productService";
import { subscribeToSales } from "../../services/saleService";
import { subscribeToOpenAlerts } from "../../services/alertService";
import { getShop } from "../../services/shopService";
import { Product, Sale, StockoutAlert, Shop } from "../../types";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 25 }: {
  name: IconName; size?: number;
}) => <Ionicons name={name} size={size} color={theme.black} />;

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<StockoutAlert[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (!user?.shopId) return;

    const id = user.shopId;
    const unsub = [
      subscribeToProducts(id, setProducts),
      subscribeToSales(id, todayStart(), setSales),
      subscribeToOpenAlerts(id, setAlerts),
    ];

    getShop(id).then(setShop);

    return () => unsub.forEach((fn) => fn());
  }, [user?.shopId]);

  const total = sales.reduce(
    (sum, sale) => sum + sale.quantitySold * sale.unitPrice, 0
  );

  const stats: {
    label: string; value: string; icon: IconName;
    color: string; route?: string;
  }[] = [
    { label: "Today's Sales", value: `R ${total.toFixed(2)}`, icon: "cash-outline", color: theme.green },
    { label: "Products Tracked", value: String(products.length), icon: "cube-outline", color: theme.purple },
    { label: "Stock Alerts", value: String(alerts.length), icon: "notifications-outline", color: theme.pink, route: "Alerts" },
    { label: "Sales Today", value: String(sales.length), icon: "receipt-outline", color: theme.blue },
  ];

  const actions: { title: string; icon: IconName; route: string }[] = [
    { title: "Log a Sale", icon: "cart-outline", route: "LogSale" },
    { title: "Restock", icon: "add-circle-outline", route: "Restock" },
  ];

  return (
    <ScrollView style={c.screen} contentContainerStyle={s.content}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>YOUR STORE DASHBOARD</Text>
          <Text style={s.greeting}>
            {greeting()}{user ? `, ${user.name.split(" ")[0]}!` : "!"}
          </Text>
          <Text style={s.shopName}>{shop?.shopName || "Your Shop"}</Text>
        </View>
        <View style={[c.iconBox, c.shadow, s.headerIcon]}>
          <Icon name="storefront-outline" size={29} />
        </View>
      </View>

      <View style={s.shadowBox}>
        <View style={s.banner}>
          <Text style={s.eyebrow}>WELCOME TO STOQ</Text>
          <Text style={s.bannerTitle}>Your shop.{"\n"}Under control.</Text>
          <Text style={s.bannerText}>
            Track your stock, manage sales and stay ahead.
          </Text>
          <View style={s.sparkle}>
            <Icon name="sparkles" size={32} />
          </View>
        </View>
      </View>

      {alerts.length > 0 && (
        <TouchableOpacity
          style={[s.shadowBox, { marginBottom: 25 }]}
          onPress={() => navigation.navigate("Alerts")}
        >
          <View style={[s.alertCard, s.offset]}>
            <Icon name="warning-outline" size={27} />
            <View style={{ flex: 1 }}>
              <Text style={s.bold}>Stock needs attention!</Text>
              <Text style={s.small}>
                {alerts.length} open stock {alerts.length === 1 ? "alert" : "alerts"}
              </Text>
            </View>
            <Icon name="arrow-forward" size={22} />
          </View>
        </TouchableOpacity>
      )}

      <Text style={s.sectionTitle}>At a glance</Text>
      <View style={s.grid}>
        {stats.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={s.tileShadow}
            activeOpacity={item.route ? 0.8 : 1}
            disabled={!item.route}
            onPress={() => item.route && navigation.navigate(item.route)}
          >
            <View style={[s.tile, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={27} />
              <Text style={s.statLabel}>{item.label}</Text>
              <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {item.value}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionTitle}>Quick actions</Text>
      <View style={s.grid}>
        {actions.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={s.tileShadow}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={[s.tile, s.actionTile]}>
              <Icon name={item.icon} size={29} />
              <Text style={s.actionText}>{item.title}</Text>
              <Icon name="arrow-forward" size={20} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Recent sales</Text>
        <Icon name="time-outline" size={22} />
      </View>

      {sales.length === 0 ? (
        <View style={s.empty}>
          <Icon name="receipt-outline" size={38} />
          <Text style={s.emptyTitle}>Nothing here yet!</Text>
          <Text style={c.subtitle}>
            Your sales will appear here once you log them.
          </Text>
        </View>
      ) : (
        sales.slice(0, 5).map((sale) => (
          <View key={sale.saleId} style={s.saleCard}>
            <View style={[c.iconBox, { backgroundColor: theme.green }]}>
              <Icon name="bag-check-outline" size={23} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.saleTitle}>
                {sale.quantitySold} item(s) sold
              </Text>
              <Text style={c.subtitle}>Completed sale</Text>
            </View>
            <Text style={s.saleAmount}>
              R {(sale.quantitySold * sale.unitPrice).toFixed(2)}
            </Text>
          </View>
        ))
      )}
      <View style={{ height: 35 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row", alignItems: "center",
    marginTop: 8, marginBottom: 25,
  },
  eyebrow: {
    fontSize: 11, fontWeight: "900", letterSpacing: 1.5,
    color: theme.muted, marginBottom: 7,
  },
  greeting: { fontSize: 25, fontWeight: "900", color: theme.black },
  shopName: {
    fontSize: 15, fontWeight: "600",
    color: theme.muted, marginTop: 5,
  },
  headerIcon: {
    width: 54, height: 54, borderWidth: 2.5,
    backgroundColor: theme.yellow, borderRadius: 14,
    marginLeft: 10,
  },
  shadowBox: {
    backgroundColor: theme.black, borderRadius: 18,
    marginRight: 5, marginBottom: 29,
  },
  offset: { transform: [{ translateX: -4 }, { translateY: -4 }] },
  banner: {
    ...c.card, backgroundColor: theme.yellow,
    borderRadius: 18, padding: 22, minHeight: 190,
    marginBottom: 0, overflow: "hidden",
    transform: [{ translateX: -5 }, { translateY: -5 }],
  },
  bannerTitle: {
    fontSize: 32, fontWeight: "900",
    lineHeight: 37, color: theme.black,
  },
  bannerText: {
    fontSize: 12, fontWeight: "600",
    color: theme.black, marginTop: 12, maxWidth: "80%",
  },
  sparkle: { position: "absolute", right: 20, top: 48 },
  alertCard: {
    backgroundColor: "#FFE0E6", borderWidth: 2,
    borderColor: theme.black, borderRadius: 13,
    padding: 14, flexDirection: "row",
    alignItems: "center", gap: 12,
  },
  bold: { fontSize: 15, fontWeight: "900", color: theme.black },
  small: { fontSize: 12, color: theme.black, marginTop: 4 },
  sectionTitle: {
    fontSize: 22, fontWeight: "900",
    color: theme.black, marginBottom: 16,
  },
  grid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 14, marginBottom: 25,
  },
  tileShadow: {
    width: "47%", backgroundColor: theme.black,
    borderRadius: 14, marginBottom: 4,
  },
  tile: {
    minHeight: 145, padding: 14, justifyContent: "space-between",
    borderWidth: 2.5, borderColor: theme.black, borderRadius: 14,
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },
  statLabel: { fontSize: 13, fontWeight: "800", color: theme.black },
  statValue: { fontSize: 24, fontWeight: "900", color: theme.black },
  actionTile: {
    minHeight: 120, backgroundColor: theme.white,
    alignItems: "flex-start",
  },
  actionText: { fontSize: 16, fontWeight: "900", color: theme.black },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center",
  },
  empty: {
    ...c.card, borderWidth: 2, borderStyle: "dashed",
    padding: 26, alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18, fontWeight: "900",
    color: theme.black, marginTop: 10,
  },
  saleCard: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 12,
    padding: 12, marginBottom: 12,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  saleTitle: { fontSize: 13, fontWeight: "800", color: theme.black },
  saleAmount: { fontSize: 14, fontWeight: "900", color: theme.black },
});

