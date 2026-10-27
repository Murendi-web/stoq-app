
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme, commonStyles as c } from "../theme/styles";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
    quantity: number;
    minStock?: number;
    price?: number;
    sellingPrice?: number;
    category?: string;
  };
  onPress?: () => void;
};

export default function ProductCard({
  product,
  onPress,
}: ProductCardProps) {
  const quantity = Number(product.quantity ?? 0);
  const minStock = Number(product.minStock ?? 5);
  const price = Number(
    product.sellingPrice ?? product.price ?? 0
  );

  const isOutOfStock = quantity <= 0;
  const isLowStock = !isOutOfStock && quantity <= minStock;

  const status = isOutOfStock
    ? "OUT OF STOCK"
    : isLowStock
    ? "LOW STOCK"
    : "IN STOCK";

  const statusColor = isOutOfStock
    ? theme.pink
    : isLowStock
    ? theme.yellow
    : theme.green;

  return (
    <TouchableOpacity
      style={[c.card, c.shadow, styles.card]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={styles.productIcon}>
          <Ionicons
            name="cube-outline"
            size={25}
            color={theme.black}
          />
        </View>

        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>

          <Text style={styles.productCode}>
            {product.sku || product.barcode || "NO SKU"}
          </Text>
        </View>

        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={22}
            color={theme.black}
          />
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.label}>SELLING PRICE</Text>
          <Text style={styles.price}>
            R {price.toFixed(2)}
          </Text>
        </View>

        <View style={styles.stockSection}>
          <Text style={styles.label}>QUANTITY</Text>
          <Text style={styles.quantity}>
            {quantity}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusColor },
        ]}
      >
        <Ionicons
          name={
            isOutOfStock
              ? "close-circle-outline"
              : isLowStock
              ? "warning-outline"
              : "checkmark-circle-outline"
          }
          size={16}
          color={theme.black}
        />

        <Text style={styles.statusText}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  productIcon: {
    width: 48,
    height: 48,
    backgroundColor: theme.purple,
    borderWidth: 2,
    borderColor: theme.black,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.black,
    marginBottom: 5,
  },
  productCode: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.muted,
  },
  divider: {
    height: 2,
    backgroundColor: theme.black,
    marginVertical: 14,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: theme.muted,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.black,
  },
  stockSection: {
    alignItems: "flex-end",
  },
  quantity: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.black,
  },
  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: theme.black,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 14,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    color: theme.black,
  },
});
