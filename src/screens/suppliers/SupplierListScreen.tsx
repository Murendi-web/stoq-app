import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { subscribeToSuppliers } from "../../services/supplierService";
import { colors } from "../../theme/colors";
import { Supplier } from "../../types";

export default function SupplierListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToSuppliers(user.shopId, setSuppliers);
  }, [user?.shopId]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("SupplierForm")}>
        <Text style={styles.addButtonText}>+ Add Supplier</Text>
      </TouchableOpacity>
      <FlatList
        data={suppliers}
        keyExtractor={(s) => s.supplierId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("SupplierForm", { supplierId: item.supplierId })}
          >
            <Text style={styles.name}>{item.name}</Text>
            {item.contactNumber ? <Text style={styles.meta}>{item.contactNumber}</Text> : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No suppliers added yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addButton: { margin: 16, backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "700" },
  row: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontWeight: "700", color: colors.text },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  emptyText: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
