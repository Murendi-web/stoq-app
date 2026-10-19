import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { subscribeToStaff, removeStaff } from "../../services/authService";
import { colors } from "../../theme/colors";
import { AppUser } from "../../types";

export default function StaffManagementScreen({ navigation }: any) {
  const { user } = useAuth();
  const [staff, setStaff] = useState<AppUser[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToStaff(user.shopId, setStaff);
  }, [user?.shopId]);

  const onRemove = (staffMember: AppUser) => {
    Alert.alert(
      "Remove staff member",
      `Remove ${staffMember.name}? They'll lose access to this shop immediately.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeStaff(staffMember.userId);
            } catch (err: any) {
              Alert.alert("Could not remove staff member", err.message ?? "Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("StaffForm")}>
        <Text style={styles.addButtonText}>+ Add Staff Member</Text>
      </TouchableOpacity>
      <FlatList
        data={staff}
        keyExtractor={(s) => s.userId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.email}</Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item)}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No staff added yet. Add someone so they can log sales without owner access.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addButton: { margin: 16, backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { fontWeight: "700", color: colors.text },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  removeButton: { borderWidth: 1, borderColor: colors.danger, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  removeButtonText: { color: colors.danger, fontWeight: "700", fontSize: 12 },
  emptyText: { textAlign: "center", color: colors.muted, marginTop: 40, paddingHorizontal: 20 },
});