import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/authService";
import { colors } from "../../theme/colors";

export default function MoreScreen({ navigation }: any) {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.role}>{isOwner ? "Shop Owner" : "Staff"}</Text>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Suppliers")}>
        <Text style={styles.itemText}>Manage Suppliers</Text>
      </TouchableOpacity>

      {isOwner && (
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("StaffManagement")}>
          <Text style={styles.itemText}>Manage Staff</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.item, styles.logout]} onPress={() => logout()}>
        <Text style={[styles.itemText, { color: "#fff" }]}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  name: { fontSize: 18, fontWeight: "800", color: colors.text },
  role: { color: colors.muted, marginBottom: 24 },
  item: { padding: 16, borderRadius: 8, backgroundColor: colors.backgroundMuted, marginBottom: 12 },
  itemText: { fontWeight: "600", color: colors.text },
  logout: { backgroundColor: colors.danger, marginTop: 20 },
});
