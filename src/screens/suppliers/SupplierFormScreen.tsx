import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { addSupplier, updateSupplier, deleteSupplier, subscribeToSuppliers } from "../../services/supplierService";
import { colors } from "../../theme/colors";

export default function SupplierFormScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const supplierId: string | undefined = route.params?.supplierId;
  const isEditing = Boolean(supplierId);

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  useEffect(() => {
    if (!user || !supplierId) return;
    return subscribeToSuppliers(user.shopId, (suppliers) => {
      const existing = suppliers.find((s) => s.supplierId === supplierId);
      if (existing) {
        setName(existing.name);
        setContactNumber(existing.contactNumber ?? "");
      }
    });
  }, [user?.shopId, supplierId]);

  const onSave = async () => {
    if (!user || !name) {
      Alert.alert("Missing details", "Supplier name is required.");
      return;
    }
    if (isEditing && supplierId) {
      await updateSupplier(user.shopId, supplierId, { name, contactNumber });
    } else {
      await addSupplier(user.shopId, { name, contactNumber });
    }
    navigation.goBack();
  };

  const onDelete = () => {
    if (!user || !supplierId) return;
    Alert.alert("Delete supplier", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await deleteSupplier(user.shopId, supplierId);
        navigation.goBack();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEditing ? "Edit Supplier" : "Add Supplier"}</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Supplier name" />
      <Text style={styles.label}>Contact number</Text>
      <TextInput style={styles.input} value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Supplier</Text>
      </TouchableOpacity>
      {isEditing && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete Supplier</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: "800", color: colors.primary, marginBottom: 20 },
  label: { fontSize: 12, color: colors.text, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, backgroundColor: colors.backgroundMuted },
  saveButton: { backgroundColor: colors.success, borderRadius: 8, padding: 14, alignItems: "center", marginTop: 24 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  deleteButton: { padding: 14, alignItems: "center", marginTop: 12 },
  deleteButtonText: { color: colors.danger, fontWeight: "700" },
});
