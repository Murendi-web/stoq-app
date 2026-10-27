import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export function BarChart({
  data,
  valueFormatter = (v: number) => String(v),
}: {
  data: { label: string; value: number }[];
  valueFormatter?: (value: number) => string;
}) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <View>
      {data.map((d) => (
        <View key={d.label} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>
            {d.label}
          </Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${Math.max(4, (d.value / maxValue) * 100)}%` }]} />
          </View>
          <Text style={styles.value}>{valueFormatter(d.value)}</Text>
        </View>
      ))}
      {data.length === 0 && <Text style={styles.empty}>No data yet.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 14 },
  label: { fontSize: 12, color: colors.text, marginBottom: 4 },
  track: { height: 14, backgroundColor: colors.backgroundMuted, borderRadius: 7, overflow: "hidden" },
  bar: { height: "100%", backgroundColor: colors.primary, borderRadius: 7 },
  value: { fontSize: 11, color: colors.muted, marginTop: 3, textAlign: "right" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 20 },
});