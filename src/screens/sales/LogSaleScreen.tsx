import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useOfflineQueueContext } from "../../context/OfflineQueueContext";
import { subscribeToProducts } from "../../services/productService";
import { QuantityStepper } from "../../components/QuantityStepper";
import { Product } from "../../types";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 22 }: {
  name: IconName; size?: number;
}) => <Ionicons name={name} size={size} color={theme.black} />;

const Header = ({ confirm }: { confirm: boolean }) => (
  <>
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        <Text style={s.eyebrow}>STOQ SALES</Text>
        <Text style={c.heading}>
          {confirm ? "Confirm Sale" : "Log a Sale"}
        </Text>
        <Text style={c.subtitle}>
          {confirm
            ? "Review the details before saving."
            : "Choose a product to get started."}
        </Text>
      </View>
      <View style={[c.iconBox, s.headerIcon]}>
        <Icon name={confirm ? "receipt-outline" : "cart-outline"} size={28} />
      </View>
    </View>

    <View style={s.stepBanner}>
      <View style={s.circle}>
        <Text style={s.stepNumber}>{confirm ? "2" : "1"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.bold}>
          {confirm ? "Sale details" : "Select a product"}
        </Text>
        <Text style={s.small}>
          {confirm
            ? "Set the quantity and confirm"
            : "Scan a barcode or search below"}
        </Text>
      </View>
    </View>
  </>
);

export default function LogSaleScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { enqueue, isConnected } = useOfflineQueueContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.shopId) return;
    return subscribeToProducts(user.shopId, setProducts);
  }, [user?.shopId]);

  useEffect(() => {
    const code = route.params?.scannedBarcode;
    if (!code) return;

    const match = products.find((p) => p.barcode === code);

    if (match) {
      setSelected(match);
      setQuantity(1);
      navigation.setParams({ scannedBarcode: undefined });
    } else if (products.length > 0) {
      navigation.setParams({ scannedBarcode: undefined });
      Alert.alert(
        "Product not found",
        "No product in your inventory matches that barcode."
      );
    }
  }, [route.params?.scannedBarcode, products]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const current = selected
    ? products.find((p) => p.productId === selected.productId) ?? selected
    : null;

  const choose = (product: Product | null) => {
    setSelected(product);
    setQuantity(1);
  };

  const onConfirm = async () => {
    if (!user || !current || saving) return;

    if (!Number.isInteger(quantity) ||
        quantity < 1 || quantity > current.currentQty) {
      Alert.alert(
        "Invalid quantity",
        "Please select a quantity that is available in stock."
      );
      return;
    }

    setSaving(true);
    try {
      await enqueue("LOG_SALE", {
        shopId: user.shopId,
        productId: current.productId,
        quantitySold: quantity,
        unitPrice: current.unitPrice,
        loggedByUserId: user.userId,
      });

      Alert.alert(
        isConnected ? "Sale logged" : "Sale queued",
        isConnected
          ? "Your sale has been submitted."
          : "You're offline. This sale will sync automatically when you're back online."
      );
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Could not log sale", err?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!current) {
    return (
      <View style={c.screen}>
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.productId}
          contentContainerStyle={[c.content, { flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              <Header confirm={false} />

              <TouchableOpacity
                style={[c.button, s.scanButton]}
                onPress={() => navigation.navigate("BarcodeScanner", {
                  returnScreen: "LogSale",
                })}
              >
                <Icon name="scan-outline" size={26} />
                <Text style={s.buttonText}>Scan Barcode</Text>
                <Icon name="arrow-forward" />
              </TouchableOpacity>

              <Text style={s.eyebrow}>OR SEARCH YOUR INVENTORY</Text>
              <View style={[c.inputWrapper, s.searchBox]}>
                <Icon name="search-outline" size={21} />
                <TextInput
                  style={c.input}
                  placeholder="Search products..."
                  placeholderTextColor="#888888"
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                />
              </View>

              <Text style={s.section}>Products ({filtered.length})</Text>
            </>
          }
          renderItem={({ item }) => {
            const out = item.currentQty <= 0;
            const low = !out && item.currentQty <= item.reorderThreshold;

            return (
              <TouchableOpacity
                style={[s.productCard, out && { opacity: 0.55 }]}
                onPress={() => choose(item)}
                disabled={out}
              >
                <View style={[c.iconBox, s.productIcon]}>
                  <Icon name="cube-outline" size={23} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={c.subtitle}>
                    {item.currentQty} in stock
                  </Text>
                  {(low || out) && (
                    <Text style={{
                      color: out ? "#B42332" : "#A15A00",
                      fontSize: 11, fontWeight: "800",
                    }}>
                      {out ? "Out of stock" : "Low stock"}
                    </Text>
                  )}
                </View>

                <View style={{ alignItems: "flex-end", gap: 7 }}>
                  <Text style={s.productName}>
                    R {item.unitPrice.toFixed(2)}
                  </Text>
                  <Icon name="chevron-forward" size={21} />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Icon name="cube-outline" size={36} />
              <Text style={s.bold}>No products found</Text>
              <Text style={c.subtitle}>
                Try another product name or add products to your inventory first.
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <ScrollView style={c.screen} contentContainerStyle={c.content}>
      <Header confirm />

      <Text style={s.section}>Selected product</Text>
      <TouchableOpacity
        style={s.productCard}
        onPress={() => choose(null)}
        disabled={saving}
      >
        <View style={[c.iconBox, { backgroundColor: theme.purple }]}>
          <Icon name="cube-outline" size={27} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.productName}>{current.name}</Text>
          <Text style={c.subtitle}>
            {current.currentQty} units available
          </Text>
        </View>
        <Text style={s.change}>Change</Text>
      </TouchableOpacity>

      <View style={c.card}>
        <Text style={s.bold}>Quantity sold</Text>
        <View style={{ marginTop: 18, alignItems: "flex-start" }}>
          <QuantityStepper
            value={quantity}
            onChange={(value) =>
              setQuantity(Math.max(
                1, Math.min(value, Math.max(1, current.currentQty))
              ))
            }
            min={1}
          />
        </View>
        <Text style={[c.subtitle, { marginTop: 15 }]}>
          Available stock: {current.currentQty} units
        </Text>
      </View>

      <View style={[c.card, { backgroundColor: theme.yellow }]}>
        <View style={c.sectionHeading}>
          <Icon name="receipt-outline" size={23} />
          <Text style={c.sectionTitle}>Sale Summary</Text>
        </View>

        {[
          ["Unit price", `R ${current.unitPrice.toFixed(2)}`],
          ["Quantity", `× ${quantity}`],
        ].map(([label, value]) => (
          <View key={label} style={s.summaryRow}>
            <Text style={s.summaryLabel}>{label}</Text>
            <Text style={s.productName}>{value}</Text>
          </View>
        ))}

        <View style={s.divider} />
        <View style={s.summaryRow}>
          <Text style={s.bold}>TOTAL</Text>
          <Text style={s.total} numberOfLines={1} adjustsFontSizeToFit>
            R {(current.unitPrice * quantity).toFixed(2)}
          </Text>
        </View>
      </View>

      {!isConnected && (
        <View style={[s.productCard, { backgroundColor: theme.blue }]}>
          <Icon name="cloud-offline-outline" />
          <Text style={{ flex: 1, fontSize: 12, color: theme.black }}>
            You're offline. This sale will be queued and synced when your
            connection returns.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[c.button, (saving || current.currentQty <= 0) && { opacity: 0.6 }]}
        onPress={onConfirm}
        disabled={saving || current.currentQty <= 0}
      >
        <Icon name="checkmark-circle-outline" size={24} />
        <Text style={s.buttonText}>
          {saving ? "Saving..." : "Confirm Sale"}
        </Text>
        <Icon name="arrow-forward" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginTop: 8, marginBottom: 25,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900", letterSpacing: 1.5,
    color: theme.muted, marginBottom: 10,
  },
  headerIcon: {
    width: 56, height: 56, backgroundColor: theme.pink,
    borderWidth: 2.5, borderRadius: 14,
  },
  stepBanner: {
    backgroundColor: theme.yellow, borderWidth: 2.5,
    borderColor: theme.black, borderRadius: 14,
    padding: 15, flexDirection: "row",
    alignItems: "center", gap: 12, marginBottom: 25,
  },
  circle: {
    width: 39, height: 39, borderRadius: 20,
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontSize: 19, fontWeight: "900", color: theme.black,
  },
  bold: { fontSize: 17, fontWeight: "900", color: theme.black },
  small: { fontSize: 12, color: theme.black, marginTop: 4 },
  scanButton: {
    backgroundColor: theme.purple,
    justifyContent: "space-between", marginBottom: 25,
  },
  buttonText: { fontSize: 17, fontWeight: "900", color: theme.black },
  searchBox: {
    backgroundColor: theme.white, marginBottom: 25,
  },
  section: {
    fontSize: 20, fontWeight: "900",
    color: theme.black, marginBottom: 15,
  },
  productCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 13,
    padding: 13, marginBottom: 12,
  },
  productIcon: {
    width: 46, height: 46, backgroundColor: theme.blue,
  },
  productName: { fontSize: 14, fontWeight: "900", color: theme.black },
  empty: {
    ...c.card, borderStyle: "dashed",
    alignItems: "center", gap: 10, padding: 30,
  },
  change: {
    fontSize: 12, fontWeight: "900",
    color: theme.black, textDecorationLine: "underline",
  },
  summaryRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 12,
  },
  summaryLabel: { fontSize: 13, fontWeight: "700", color: theme.black },
  divider: {
    height: 2, backgroundColor: theme.black,
    marginVertical: 13,
  },
  total: {
    fontSize: 26, fontWeight: "900",
    color: theme.black, flexShrink: 1,
  },
});
