import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

/**
 * Small inline spinner + optional label, used for in-progress states
 * (saving, loading a list) so the user gets feedback beyond a disabled
 * button — addresses the "no loading state" gap noted after the first build.
 */
export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <View style={styles.row}>
      <ActivityIndicator size="small" color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 8 },
  label: { color: colors.muted, fontSize: 12 },
});
