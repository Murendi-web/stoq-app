import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { addProduct, updateProduct, deleteProduct, subscribeToProducts } from "../../services/productService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Dropdown } from "../../components/Dropdown";
import { PRODUCT_CATEGORIES } from "../../constants/categories";
import { colors } from "../../theme/colors";
import { Product } from "../../types";

export default function ProductFormScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const productId: string | undefined = route.params?.productId;
  const isEditing = Boolean(productId);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryOther, setCategoryOther] = useState("");
  const [brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [currentQty, setCurrentQty] = useState("");
  const [reorderThreshold, setReorderThreshold] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !productId) return;
    const unsub = subscribeToProducts(user.shopId, (products) => {
      const existing = products.find((p) => p.productId === productId);
      if (existing) {
        setName(existing.name);
        const existingCategory = existing.category ?? "";
        if (existingCategory && !PRODUCT_CATEGORIES.includes(existingCategory)) {
          setCategory("Other");
          setCategoryOther(existingCategory);
        } else {
          setCategory(existingCategory);
        }
        setBrand(existing.brand ?? "");
        setBarcode(existing.barcode ?? "");
        setUnitPrice(String(existing.unitPrice));
        setCurrentQty(String(existing.currentQty));
        setReorderThreshold(String(existing.reorderThreshold));
      }
    });
    return unsub;
  }, [user?.shopId, productId]);

  // Picks up a barcode handed back from BarcodeScannerScreen (see navigation.navigate with merge: true there).
  useEffect(() => {
    if (route.params?.scannedBarcode) {
      setBarcode(route.params.scannedBarcode);
      navigation.setParams({ scannedBarcode: undefined });
    }
  }, [route.params?.scannedBarcode]);

  const onSave = async () => {
    if (!user) return;
    if (!name || !unitPrice || !currentQty || !reorderThreshold) {
      Alert.alert("Missing details", "Name, price, quantity and threshold are required.");
      return;
    }
    const finalCategory = category === "Other" ? categoryOther.trim() : category;
    setLoading(true);
    try {
      // Firestore rejects a field whose value is `undefined`, so every
      // optional field is left out of the object entirely when blank,
      // not passed through as e.g. `brand: undefined`.
      const data: Omit<Product, "productId" | "shopId"> = {
        name,
        unitPrice: Number(unitPrice),
        currentQty: Number(currentQty),
        reorderThreshold: Number(reorderThreshold),
        ...(finalCategory ? { category: finalCategory } : {}),
        ...(brand ? { brand } : {}),
        ...(barcode ? { barcode } : {}),
      };
      if (isEditing && productId) {
        await updateProduct(user.shopId, productId, data);
      } else {
        await addProduct(user.shopId, data);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Save failed", err.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = () => {
    if (!user || !productId) return;
    Alert.alert("Delete product", `Remove "${name}" from your stock list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteProduct(user.shopId, productId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEditing ? "Edit Product" : "Add Product"}</Text>

      <Text style={styles.label}>Product name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Coca-Cola 2L" />

      <Dropdown label="Category" value={category} options={PRODUCT_CATEGORIES} onSelect={setCategory} placeholder="Select a category" />
      {category === "Other" && (
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          value={categoryOther}
          onChangeText={setCategoryOther}
          placeholder="Type the category"
        />
      )}

      <Text style={styles.label}>Brand (optional)</Text>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="e.g. Coca-Cola" />

      <Text style={styles.label}>Barcode (optional)</Text>
      <View style={styles.barcodeRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={barcode}
          onChangeText={setBarcode}
          placeholder="Scan or type manually"
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate("BarcodeScanner", { returnScreen: "ProductForm" })}
        >
          <Text style={styles.scanButtonText}>Scan</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Unit price (R)</Text>
      <TextInput style={styles.input} value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" />

      <Text style={styles.label}>Current quantity</Text>
      <TextInput style={styles.input} value={currentQty} onChangeText={setCurrentQty} keyboardType="numeric" />

      <Text style={styles.label}>Reorder threshold</Text>
      <TextInput
        style={styles.input}
        value={reorderThreshold}
        onChangeText={setReorderThreshold}
        keyboardType="numeric"
        placeholder="Alert me when quantity drops to this level"
      />

      {loading ? (
        <LoadingSpinner label="Saving..." />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Save Product</Text>
        </TouchableOpacity>
      )}

      {isEditing && !loading && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete Product</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: 20, fontWeight: "800", color: colors.primary, marginBottom: 20 },
  label: { fontSize: 12, color: colors.text, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, backgroundColor: colors.backgroundMuted },
  barcodeRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  scanButton: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 },
  scanButtonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  saveButton: { backgroundColor: colors.success, borderRadius: 8, padding: 14, alignItems: "center", marginTop: 24 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  deleteButton: { padding: 14, alignItems: "center", marginTop: 12 },
  deleteButtonText: { color: colors.danger, fontWeight: "700" },
});