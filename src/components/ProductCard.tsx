import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { Product } from "../types";

export function ProductCard({ product, onPress }: { product: Product; onPress?: () => void }) {
  const isLow = product.currentQty <= product.reorderThreshold;
  return (
    <TouchableOpacity
      style={[styles.card, isLow && styles.cardLow]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={[styles.meta, isLow && { color: colors.warning }]}>
          Qty: {product.currentQty} · Threshold: {product.reorderThreshold}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: isLow ? colors.danger : colors.successLight }]}>
        <Text style={[styles.badgeText, { color: isLow ? "#fff" : colors.success }]}>
          {isLow ? "LOW STOCK" : "OK"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLow: { backgroundColor: colors.warningLight, borderColor: colors.danger },
  name: { fontWeight: "700", color: colors.text, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: "700" },
});
