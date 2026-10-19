import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { subscribeToProducts } from "../../services/productService";
import { ProductCard } from "../../components/ProductCard";
import { colors } from "../../theme/colors";
import { Product } from "../../types";

export default function StockListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    return subscribeToProducts(user.shopId, setProducts);
  }, [user?.shopId]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.category ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.search}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("ProductForm")}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.productId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate("ProductForm", { productId: item.productId })}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No products yet — tap + to add one.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: 16, gap: 10 },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: colors.backgroundMuted,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontSize: 20, lineHeight: 22 },
  emptyText: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
