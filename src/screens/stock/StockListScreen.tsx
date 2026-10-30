import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, TextInput, FlatList,
  StyleSheet, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import { subscribeToProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard";
import { Product } from "../../types";
import { theme, commonStyles as c } from "../../theme/styles";

export default function StockListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.shopId) {
      setProducts([]);
      return;
    }
    return subscribeToProducts(user.shopId, setProducts);
  }, [user?.shopId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const addProduct = () => navigation.navigate("ProductForm");

  const Icon = ({ name, size = 22 }: any) => (
    <Ionicons name={name} size={size} color={theme.black} />
  );

  return (
    <View style={c.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={[c.content, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.eyebrow}>STOQ INVENTORY</Text>
                <Text style={[c.heading, { fontSize: 27 }]}>
                  Your Inventory
                </Text>
                <Text style={c.subtitle}>
                  Manage and track your shop's products.
                </Text>
              </View>
              <View style={s.headerIcon}>
                <Icon name="cube-outline" size={28} />
              </View>
            </View>

            <View style={s.summaryRow}>
              {[
                {
                  title: "TOTAL PRODUCTS",
                  value: products.length,
                  caption: "Products in your shop",
                  icon: "cube-outline",
                  color: theme.yellow,
                },
                {
                  title: "INVENTORY",
                  value: "Active",
                  caption: "Live stock tracking",
                  icon: "pulse-outline",
                  color: theme.green,
                },
              ].map((item) => (
                <View
                  key={item.title}
                  style={[
                    c.card, c.shadow, s.summaryCard,
                    { backgroundColor: item.color },
                  ]}
                >
                  <View style={s.summaryIcon}>
                    <Icon name={item.icon} size={24} />
                  </View>
                  <Text style={s.cardLabel}>{item.title}</Text>
                  <Text style={[
                    s.summaryValue,
                    { fontSize: typeof item.value === "number" ? 35 : 26 },
                  ]}>
                    {item.value}
                  </Text>
                  <Text style={s.cardFooter}>{item.caption}</Text>
                </View>
              ))}
            </View>

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Stock Items</Text>
              <View style={s.countBadge}>
                <Text style={s.countText}>{filtered.length} ITEMS</Text>
              </View>
            </View>

            <View style={s.searchRow}>
              <View style={s.searchBox}>
                <Icon name="search-outline" size={21} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search products..."
                  placeholderTextColor="#888888"
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {!!search && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons
                      name="close-circle"
                      size={21}
                      color={theme.muted}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={s.addButton}
                onPress={addProduct}
                accessibilityLabel="Add product"
              >
                <Icon name="add" size={28} />
              </TouchableOpacity>
            </View>

            {!!search.trim() && (
              <View style={s.searchInfo}>
                <Icon name="filter-outline" size={17} />
                <Text style={s.searchInfoText}>
                  Showing {filtered.length} of {products.length} products
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              navigation.navigate("ProductForm", {
                productId: item.productId,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyCard}>
            <View style={s.emptyIcon}>
              <Icon
                name={search.trim() ? "search-outline" : "cube-outline"}
                size={38}
              />
            </View>
            <Text style={s.emptyTitle}>
              {search.trim()
                ? "No Matching Products"
                : "Your Inventory Is Empty"}
            </Text>
            <Text style={s.emptyDescription}>
              {search.trim()
                ? "Try searching for a different product name or category."
                : "Start building your inventory by adding your first product."}
            </Text>
            <TouchableOpacity
              style={[c.button, s.emptyButton]}
              onPress={search.trim() ? () => setSearch("") : addProduct}
            >
              <Icon
                name={search.trim()
                  ? "refresh-outline"
                  : "add-circle-outline"}
                size={20}
              />
              <Text style={s.emptyButtonText}>
                {search.trim() ? "Clear Search" : "Add Your First Product"}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const border = {
  borderWidth: 2,
  borderColor: theme.black,
} as const;

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginTop: 8, marginBottom: 26,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 1.5, color: theme.muted, marginBottom: 5,
  },
  headerIcon: {
    width: 56, height: 56, backgroundColor: theme.purple,
    ...border, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  summaryRow: {
    flexDirection: "row", gap: 12, marginBottom: 7,
  },
  summaryCard: {
    flex: 1, padding: 14, minHeight: 175, marginBottom: 23,
    shadowOffset: { width: 3, height: 3 }, elevation: 3,
  },
  summaryIcon: {
    width: 40, height: 40, backgroundColor: theme.white,
    ...border, borderRadius: 10,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 0.6, color: theme.black,
  },
  summaryValue: {
    fontWeight: "900", color: theme.black, marginTop: 7,
  },
  cardFooter: {
    fontSize: 11, color: theme.black,
    marginTop: 7, lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 17,
  },
  sectionTitle: {
    fontSize: 21, fontWeight: "900", color: theme.black,
  },
  countBadge: {
    backgroundColor: theme.pink, ...border,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  countText: {
    fontSize: 10, fontWeight: "900", color: theme.black,
  },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    gap: 11, marginBottom: 20,
  },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center",
    gap: 10, backgroundColor: theme.white, ...border,
    borderRadius: 12, paddingHorizontal: 13, minHeight: 53,
  },
  searchInput: {
    flex: 1, fontSize: 13, color: theme.black,
    paddingVertical: 12, minWidth: 0,
  },
  addButton: {
    width: 53, height: 53, backgroundColor: theme.purple,
    ...border, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  searchInfo: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: theme.blue, ...border,
    borderRadius: 10, padding: 11, marginBottom: 17,
  },
  searchInfoText: {
    fontSize: 12, fontWeight: "700", color: theme.black,
  },
  emptyCard: {
    backgroundColor: theme.white, ...border,
    borderStyle: "dashed", borderRadius: 16,
    padding: 26, alignItems: "center", marginTop: 8,
  },
  emptyIcon: {
    width: 79, height: 79, backgroundColor: theme.yellow,
    ...border, borderRadius: 19,
    alignItems: "center", justifyContent: "center", marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 19, fontWeight: "900", color: theme.black,
    textAlign: "center", marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 12, color: theme.muted, textAlign: "center",
    lineHeight: 19, marginBottom: 22,
  },
  emptyButton: {
    paddingVertical: 12, paddingHorizontal: 15,
  },
  emptyButtonText: {
    fontSize: 12, fontWeight: "900", color: theme.black,
  },
});
