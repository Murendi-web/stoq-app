import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ScrollView, Alert, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useOfflineQueueContext } from "../../context/OfflineQueueContext";
import { subscribeToProducts } from "../../services/productService";
import { QuantityStepper } from "../../components/QuantityStepper";
import { Product } from "../../types";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 22 }: { name: IconName; size?: number }) =>
  <Ionicons name={name} size={size} color={theme.black} />;

const Header = ({ confirm }: { confirm: boolean }) => (
  <>
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.eyebrow}>STOQ INVENTORY</Text>
        <Text style={c.heading}>
          {confirm ? "Confirm Restock" : "Record Restock"}
        </Text>
        <Text style={c.subtitle}>
          {confirm
            ? "Review your new stock quantity."
            : "Add new stock to your inventory."}
        </Text>
      </View>
      <View style={[c.iconBox, s.headerIcon]}>
        <Icon name={confirm ? "add-circle-outline" : "cube-outline"} size={28} />
      </View>
    </View>

    <View style={[c.card, s.banner]}>
      <View style={[c.iconBox, s.stepCircle]}>
        <Text style={s.stepNumber}>{confirm ? "2" : "1"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>
          {confirm ? "Restock details" : "Choose a product"}
        </Text>
        <Text style={s.small}>
          {confirm
            ? "Enter the quantity received"
            : "Select the item you're restocking"}
        </Text>
      </View>
    </View>
  </>
);

export default function RestockScreen({ navigation }: any) {
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

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const product = selected
    ? products.find((p) => p.productId === selected.productId) ?? selected
    : null;

  const choose = (item: Product | null) => {
    setSelected(item);
    setQuantity(1);
  };

  const onConfirm = async () => {
    if (!user || !product || saving) return;

    if (!Number.isInteger(quantity) || quantity < 1) {
      Alert.alert("Invalid quantity", "Please enter a valid quantity greater than zero.");
      return;
    }

    setSaving(true);
    try {
      await enqueue("RECORD_RESTOCK", {
        shopId: user.shopId,
        productId: product.productId,
        type: "restock",
        quantityChanged: quantity,
        loggedByUserId: user.userId,
      });

      Alert.alert(
        isConnected ? "Restock recorded" : "Restock queued",
        isConnected
          ? "Your restock has been submitted."
          : "You're offline. This restock will sync automatically when your connection returns."
      );
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Could not record restock", err?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!product) {
    return (
      <View style={c.screen}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.productId}
          contentContainerStyle={[c.content, { flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              <Header confirm={false} />
              <Text style={c.label}>SEARCH YOUR INVENTORY</Text>
              <View style={c.inputWrapper}>
                <Ionicons name="search-outline" size={21} color={theme.muted} />
                <TextInput
                  style={c.input}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search products..."
                  placeholderTextColor="#888"
                  autoCapitalize="none"
                />
              </View>
              <Text style={s.sectionTitle}>
                Products ({filtered.length})
              </Text>
            </>
          }
          renderItem={({ item }) => {
            const out = item.currentQty <= 0;
            const low = !out && item.currentQty <= item.reorderThreshold;

            return (
              <TouchableOpacity
                style={s.productCard}
                onPress={() => choose(item)}
              >
                <View style={[c.iconBox, s.productIcon, {
                  backgroundColor: out ? theme.pink
                    : low ? theme.yellow : theme.blue,
                }]}>
                  <Icon name="cube-outline" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.bold} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={c.subtitle}>
                    {item.currentQty} units in stock
                  </Text>
                  {(out || low) && (
                    <Text style={s.warning}>
                      {out ? "Out of stock" : "Low stock"}
                    </Text>
                  )}
                </View>
                <Icon name="chevron-forward" />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Icon name="cube-outline" size={37} />
              <Text style={s.title}>No products found</Text>
              <Text style={[c.subtitle, { textAlign: "center" }]}>
                Try another search or add products to your inventory first.
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

      <Text style={s.sectionTitle}>Selected product</Text>
      <TouchableOpacity
        style={s.productCard}
        onPress={() => choose(null)}
        disabled={saving}
      >
        <View style={[c.iconBox, s.productIcon, {
          backgroundColor: theme.purple,
        }]}>
          <Icon name="cube-outline" size={26} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.bold}>{product.name}</Text>
          <Text style={c.subtitle}>
            {product.currentQty} currently in stock
          </Text>
        </View>
        <Text style={[s.bold, { textDecorationLine: "underline" }]}>
          Change
        </Text>
      </TouchableOpacity>

      <View style={c.card}>
        <Text style={s.title}>Quantity received</Text>
        <View style={{ marginVertical: 18, alignItems: "flex-start" }}>
          <QuantityStepper
            value={quantity}
            onChange={(value) =>
              setQuantity(Math.max(1, Math.floor(value)))
            }
            min={1}
          />
        </View>
        <Text style={c.subtitle}>
          Enter the number of new units received.
        </Text>
      </View>

      <View style={[c.card, s.preview]}>
        <View style={s.row}>
          <Icon name="layers-outline" />
          <Text style={s.title}>Stock Preview</Text>
        </View>

        <View style={[s.row, { justifyContent: "space-around" }]}>
          <View style={s.stockColumn}>
            <Text style={s.small}>Current</Text>
            <Text style={s.stockNumber}>{product.currentQty}</Text>
          </View>
          <Icon name="arrow-forward" size={26} />
          <View style={s.stockColumn}>
            <Text style={s.small}>After Restock</Text>
            <Text style={s.stockNumber}>
              {product.currentQty + quantity}
            </Text>
          </View>
        </View>

        <View style={s.added}>
          <Icon name="add-circle-outline" size={18} />
          <Text style={s.bold}>+{quantity} units added</Text>
        </View>
      </View>

      {!isConnected && (
        <View style={[s.productCard, {
          backgroundColor: theme.yellow,
        }]}>
          <Icon name="cloud-offline-outline" />
          <Text style={{ flex: 1, fontSize: 12, color: theme.black }}>
            You're offline. This restock will be queued and synced
            when your connection returns.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[c.button, saving && { opacity: 0.6 }]}
        onPress={onConfirm}
        disabled={saving}
      >
        <Icon name="checkmark-circle-outline" size={24} />
        <Text style={c.buttonText}>
          {saving ? "Saving..." : "Confirm Restock"}
        </Text>
        <Icon name="arrow-forward" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 20,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 1.5, color: theme.muted,
  },
  headerIcon: {
    width: 56, height: 56, backgroundColor: theme.green,
  },
  banner: {
    flexDirection: "row", alignItems: "center",
    gap: 12, backgroundColor: theme.yellow, padding: 15,
    marginBottom: 25,
  },
  stepCircle: {
    width: 39, height: 39, borderRadius: 20,
    backgroundColor: theme.white,
  },
  stepNumber: {
    fontSize: 19, fontWeight: "900", color: theme.black,
  },
  title: {
    fontSize: 17, fontWeight: "900", color: theme.black,
  },
  small: {
    fontSize: 12, color: theme.black, marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20, fontWeight: "900",
    color: theme.black, marginBottom: 15,
  },
  productCard: {
    flexDirection: "row", alignItems: "center",
    gap: 12, backgroundColor: theme.white,
    borderWidth: 2, borderColor: theme.black,
    borderRadius: 13, padding: 13, marginBottom: 12,
  },
  productIcon: { width: 46, height: 46 },
  bold: {
    fontSize: 14, fontWeight: "900", color: theme.black,
  },
  warning: {
    fontSize: 11, fontWeight: "800",
    color: "#B42332", marginTop: 4,
  },
  empty: {
    ...c.card, borderStyle: "dashed",
    alignItems: "center", padding: 30,
  },
  preview: { backgroundColor: theme.blue },
  stockColumn: { alignItems: "center", flex: 1 },
  stockNumber: {
    fontSize: 31, fontWeight: "900",
    color: theme.black, marginTop: 7,
  },
  added: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 7,
    backgroundColor: theme.green,
    borderWidth: 2, borderColor: theme.black,
    borderRadius: 10, padding: 10,
  },
});
