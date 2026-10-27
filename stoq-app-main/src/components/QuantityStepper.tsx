import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.valueBox}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onChange(value + 1)}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  valueBox: {
    width: 90,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: { fontSize: 16, color: colors.text },
  button: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 18, color: colors.primary, fontWeight: "700" },
});
