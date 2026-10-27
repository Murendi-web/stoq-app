import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";

export function AlertBanner({ count, onPress }: { count: number; onPress: () => void }) {
  if (count === 0) return null;
  return (
    <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.title}>⚠ {count} product{count === 1 ? "" : "s"} low on stock</Text>
      <Text style={styles.subtitle}>Tap to view stockout alerts</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warningLight,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  title: { color: colors.warning, fontWeight: "700", fontSize: 13 },
  subtitle: { color: colors.warning, fontSize: 11, marginTop: 2 },
});
