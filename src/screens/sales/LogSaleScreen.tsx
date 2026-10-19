import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useOfflineQueueContext } from "../../context/OfflineQueueContext";
import { subscribeToProducts } from "../../services/productService";
import { QuantityStepper } from "../../components/QuantityStepper";
import { colors } from "../../theme/colors";
import { Product } from "../../types";

export default function LogSaleScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { enqueue, isConnected } = useOfflineQueueContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToProducts(user.shopId, setProducts);
  }, [user?.shopId]);

  // Picks up a barcode handed back from BarcodeScannerScreen and auto-selects the matching product.
  useEffect(() => {
    const code = route.params?.scannedBarcode;
    if (!code) return;
    navigation.setParams({ scannedBarcode: undefined });
    const match = products.find((p) => p.barcode === code);
    if (match) {
      setSelected(match);
    } else {
      Alert.alert("Not found", "No product in your stock list has that barcode.");
    }
  }, [route.params?.scannedBarcode, products]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const total = selected ? selected.unitPrice * quantity : 0;

  const onConfirm = async () => {
    if (!user || !selected) return;
    setSaving(true);
    try {
      await enqueue("LOG_SALE", {
        shopId: user.shopId,
        productId: selected.productId,
        quantitySold: quantity,
        unitPrice: selected.unitPrice,
        loggedByUserId: user.userId,
      });
      Alert.alert(
        "Sale logged",
        isConnected ? "Sale saved." : "You're offline — this sale will sync automatically once you're back online."
      );
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Could not log sale", err.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!selected) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Product</Text>

        <TouchableOpacity
          style={styles.scanRow}
          onPress={() => navigation.navigate("BarcodeScanner", { returnScreen: "LogSale" })}
        >
          <Text style={styles.scanRowText}>Scan Barcode</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.search}
          placeholder="Or search by name..."
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.productId}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productRow} onPress={() => setSelected(item)}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productMeta}>R {item.unitPrice.toFixed(2)} · {item.currentQty} in stock</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No products match your search.</Text>}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log a Sale</Text>

      <Text style={styles.label}>Product</Text>
      <TouchableOpacity style={styles.selectedBox} onPress={() => setSelected(null)}>
        <Text style={styles.selectedText}>{selected.name}</Text>
        <Text style={styles.changeText}>Change ▾</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Quantity Sold</Text>
      <QuantityStepper value={quantity} onChange={setQuantity} min={1} />

      <Text style={styles.label}>Unit Price</Text>
      <Text style={styles.priceText}>R {selected.unitPrice.toFixed(2)}</Text>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>R {total.toFixed(2)}</Text>
      </View>

      {!isConnected && (
        <Text style={styles.offlineNotice}>You're offline — this sale will be queued and synced automatically.</Text>
      )}

      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} disabled={saving}>
        <Text style={styles.confirmButtonText}>{saving ? "Saving..." : "Confirm Sale"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: "800", color: colors.primary, marginBottom: 16 },
  scanRow: { backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: "center", marginBottom: 12 },
  scanRowText: { color: "#fff", fontWeight: "700" },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.backgroundMuted,
    marginBottom: 12,
  },
  productRow: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  productName: { fontWeight: "700", color: colors.text },
  productMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  emptyText: { textAlign: "center", color: colors.muted, marginTop: 40 },
  label: { fontSize: 12, color: colors.text, marginBottom: 6, marginTop: 16 },
  selectedBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.backgroundMuted,
  },
  selectedText: { fontWeight: "700", color: colors.text },
  changeText: { color: colors.primary, fontSize: 12 },
  priceText: { fontSize: 16, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginTop: 24 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  totalLabel: { fontWeight: "700", color: colors.text, fontSize: 16 },
  totalValue: { fontWeight: "800", color: colors.primary, fontSize: 18 },
  offlineNotice: { color: colors.warning, fontSize: 12, marginTop: 16, textAlign: "center" },
  confirmButton: { backgroundColor: colors.success, borderRadius: 10, padding: 16, alignItems: "center", marginTop: 24 },
  confirmButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});