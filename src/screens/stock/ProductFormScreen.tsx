import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  addProduct, updateProduct, deleteProduct, subscribeToProducts,
} from "../../services/productService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Dropdown } from "../../components/Dropdown";
import { PRODUCT_CATEGORIES } from "../../constants/categories";
import { Product } from "../../types";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 21 }: { name: IconName; size?: number }) =>
  <Ionicons name={name} size={size} color={theme.black} />;

const Field = ({ label, value, onChange, placeholder, keyboardType }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; keyboardType?: "default" | "decimal-pad" | "number-pad" | "numeric";
}) => (
  <View style={{ marginBottom: 15 }}>
    <Text style={c.label}>{label}</Text>
    <TextInput
      style={s.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#888"
      keyboardType={keyboardType}
    />
  </View>
);

const Section = ({ title, icon, color, children }: {
  title: string; icon: IconName; color: string;
  children: React.ReactNode;
}) => (
  <View style={s.section}>
    <View style={[s.sectionHeader, { backgroundColor: color }]}>
      <Icon name={icon} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
    <View style={{ padding: 16 }}>{children}</View>
  </View>
);

export default function ProductFormScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const productId: string | undefined = route.params?.productId;
  const editing = Boolean(productId);

  const [form, setForm] = useState({
    name: "", category: "", categoryOther: "", brand: "",
    barcode: "", unitPrice: "", currentQty: "", reorderThreshold: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!user?.shopId || !productId) return;

    return subscribeToProducts(user.shopId, (products) => {
      const p = products.find((item) => item.productId === productId);
      if (!p) return;

      const custom = Boolean(
        p.category && !PRODUCT_CATEGORIES.includes(p.category)
      );

      setForm((prev) => ({
        ...prev,
        name: p.name,
        category: custom ? "Other" : p.category ?? "",
        categoryOther: custom ? p.category ?? "" : "",
        brand: p.brand ?? "",
        barcode: prev.barcode || p.barcode || "",
        unitPrice: String(p.unitPrice),
        currentQty: String(p.currentQty),
        reorderThreshold: String(p.reorderThreshold),
      }));
    });
  }, [user?.shopId, productId]);

  useEffect(() => {
    const code = route.params?.scannedBarcode;
    if (!code) return;
    set("barcode")(code);
    navigation.setParams({ scannedBarcode: undefined });
  }, [route.params?.scannedBarcode]);

  const onSave = async () => {
    if (!user || loading) return;

    const { name, category, categoryOther, brand, barcode,
      unitPrice, currentQty, reorderThreshold } = form;

    const price = Number(unitPrice);
    const qty = Number(currentQty);
    const threshold = Number(reorderThreshold);

    if (![name, unitPrice, currentQty, reorderThreshold].every((v) => v.trim())) {
      Alert.alert("Missing details", "Name, price, quantity and threshold are required.");
      return;
    }

    if (![price, qty, threshold].every(Number.isFinite) ||
        price < 0 || qty < 0 || threshold < 0 ||
        !Number.isInteger(qty) || !Number.isInteger(threshold)) {
      Alert.alert("Invalid values",
        "Enter a valid price and non-negative whole numbers for quantity and threshold.");
      return;
    }

    const finalCategory = category === "Other" ? categoryOther.trim() : category;

    const data: Omit<Product, "productId" | "shopId"> = {
      name: name.trim(),
      unitPrice: price,
      currentQty: qty,
      reorderThreshold: threshold,
      ...(finalCategory ? { category: finalCategory } : {}),
      ...(brand.trim() ? { brand: brand.trim() } : {}),
      ...(barcode.trim() ? { barcode: barcode.trim() } : {}),
    };

    setLoading(true);
    try {
      if (editing && productId)
        await updateProduct(user.shopId, productId, data);
      else
        await addProduct(user.shopId, data);

      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Save failed", err?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = () => {
    if (!user || !productId || loading) return;

    Alert.alert("Delete product", `Remove "${form.name}" from your stock list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteProduct(user.shopId, productId);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert("Delete failed", err?.message ?? "Please try again.");
            setLoading(false);
          }
        },
      },
    ]);
  };

  const fields = [
    { key: "unitPrice", label: "Unit price (R) *", placeholder: "e.g. 24.99", type: "decimal-pad" },
    { key: "currentQty", label: "Current quantity *", placeholder: "e.g. 50", type: "number-pad" },
    { key: "reorderThreshold", label: "Reorder threshold *", placeholder: "e.g. 10", type: "number-pad" },
  ] as const;

  return (
    <ScrollView
      style={c.screen}
      contentContainerStyle={c.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.header}>
        <View style={[c.iconBox, s.headerIcon]}>
          <Icon name={editing ? "create-outline" : "cube-outline"} size={30} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>STOQ INVENTORY</Text>
          <Text style={c.heading}>{editing ? "Edit Product" : "Add Product"}</Text>
          <Text style={c.subtitle}>
            {editing ? "Update your product details." : "Let's add something new to your shop!"}
          </Text>
        </View>
      </View>

      <Section title="Product Details" icon="pricetag-outline" color={theme.yellow}>
        <Field label="Product name *" value={form.name}
          onChange={set("name")} placeholder="e.g. Coca-Cola 2L" />

        <Dropdown label="Category" value={form.category}
          options={PRODUCT_CATEGORIES} onSelect={set("category")}
          placeholder="Select a category" />

        {form.category === "Other" && (
          <Field label="Custom category" value={form.categoryOther}
            onChange={set("categoryOther")} placeholder="Type your category" />
        )}

        <Field label="Brand (optional)" value={form.brand}
          onChange={set("brand")} placeholder="e.g. Coca-Cola" />
      </Section>

      <Section title="Barcode" icon="barcode-outline" color={theme.purple}>
        <Text style={c.label}>Product barcode (optional)</Text>
        <View style={s.row}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            value={form.barcode}
            onChangeText={set("barcode")}
            placeholder="Scan or type barcode"
            placeholderTextColor="#888"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={s.scan}
            onPress={() => navigation.navigate("BarcodeScanner", {
              returnScreen: "ProductForm",
            })}
          >
            <Icon name="scan-outline" />
            <Text style={s.bold}>Scan</Text>
          </TouchableOpacity>
        </View>
      </Section>

      <Section title="Pricing & Stock" icon="layers-outline" color={theme.green}>
        {fields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            value={form[field.key]}
            onChange={set(field.key)}
            placeholder={field.placeholder}
            keyboardType={field.type}
          />
        ))}

        <View style={s.tip}>
          <Icon name="bulb-outline" />
          <Text style={{ flex: 1, fontSize: 12, color: theme.black }}>
            STOQ will alert you when stock reaches or falls below
            your reorder threshold.
          </Text>
        </View>
      </Section>

      {loading ? <LoadingSpinner label="Saving..." /> : (
        <TouchableOpacity style={c.button} onPress={onSave}>
          <Icon name="checkmark-circle-outline" />
          <Text style={c.buttonText}>
            {editing ? "Save Changes" : "Add Product"}
          </Text>
          <Icon name="arrow-forward" />
        </TouchableOpacity>
      )}

      {editing && !loading && (
        <TouchableOpacity style={s.delete} onPress={onDelete}>
          <Ionicons name="trash-outline" size={19} color="#B42332" />
          <Text style={{ color: "#B42332", fontWeight: "800" }}>
            Delete Product
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    gap: 14, marginTop: 10, marginBottom: 26,
  },
  headerIcon: {
    width: 60, height: 60, backgroundColor: theme.yellow,
    borderWidth: 2.5, borderRadius: 15,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 1.5, color: theme.muted,
  },
  section: {
    backgroundColor: theme.white, borderWidth: 2.5,
    borderColor: theme.black, borderRadius: 16,
    overflow: "hidden", marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    gap: 9, paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 2.5, borderBottomColor: theme.black,
  },
  sectionTitle: {
    fontSize: 17, fontWeight: "900", color: theme.black,
  },
  input: {
    backgroundColor: theme.background, borderWidth: 2,
    borderColor: theme.black, borderRadius: 11,
    paddingHorizontal: 13, paddingVertical: 12,
    fontSize: 14, color: theme.black, minHeight: 48,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 9 },
  scan: {
    backgroundColor: theme.blue, borderWidth: 2,
    borderColor: theme.black, borderRadius: 11,
    paddingHorizontal: 13, minHeight: 48,
    flexDirection: "row", alignItems: "center", gap: 5,
  },
  bold: { fontSize: 12, fontWeight: "900", color: theme.black },
  tip: {
    backgroundColor: "#FFF4CB", borderWidth: 1.5,
    borderColor: theme.black, borderRadius: 10,
    padding: 12, flexDirection: "row", gap: 10, marginTop: 10,
  },
  delete: {
    borderWidth: 2, borderColor: "#B42332",
    backgroundColor: "#FFF0F1", borderRadius: 12,
    padding: 15, flexDirection: "row",
    justifyContent: "center", alignItems: "center",
    gap: 9, marginTop: 23,
  },
});
