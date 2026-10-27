import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { subscribeToSuppliers } from "../../services/supplierService";
import { Supplier } from "../../types";
import { theme, commonStyles as c } from "../../theme/styles";

const colors = [theme.purple, theme.blue, theme.green, theme.pink, theme.yellow];

type IconName = React.ComponentProps<typeof Ionicons>["name"];
const Icon = ({ name, size = 22, color = theme.black }: {
  name: IconName; size?: number; color?: string;
}) => <Ionicons name={name} size={size} color={color} />;

export default function SupplierListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.shopId) return;
    return subscribeToSuppliers(user.shopId, setSuppliers);
  }, [user?.shopId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.contactNumber ?? "").toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  const add = () => navigation.navigate("SupplierForm");

  return (
    <View style={c.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(s) => s.supplierId}
        contentContainerStyle={[c.content, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.eyebrow}>STOQ PARTNERS</Text>
                <Text style={c.heading}>Suppliers</Text>
                <Text style={c.subtitle}>
                  Keep your supplier contacts organised.
                </Text>
              </View>
              <View style={[c.iconBox, s.headerIcon]}>
                <Icon name="business-outline" size={28} />
              </View>
            </View>

            <View style={[c.card, c.shadow, s.overview]}>
              <View style={[s.row, { justifyContent: "space-between" }]}>
                <View style={[c.iconBox, { backgroundColor: theme.white }]}>
                  <Icon name="people-outline" size={26} />
                </View>
                <Text style={s.badge}>YOUR NETWORK</Text>
              </View>
              <Text style={s.number}>{suppliers.length}</Text>
              <Text style={s.title}>Total Suppliers</Text>
              <Text style={s.small}>
                All your supplier contacts in one place.
              </Text>
            </View>

            <TouchableOpacity style={[c.button, s.add]} onPress={add}>
              <Icon name="add-circle-outline" size={25} />
              <Text style={[c.buttonText, { flex: 1 }]}>
                Add New Supplier
              </Text>
              <Icon name="arrow-forward" />
            </TouchableOpacity>

            <Text style={c.label}>FIND A SUPPLIER</Text>
            <View style={[c.inputWrapper, { backgroundColor: theme.white }]}>
              <Icon name="search-outline" color={theme.muted} />
              <TextInput
                style={c.input}
                placeholder="Search name or phone number..."
                placeholderTextColor="#888"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
              {!!search && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  accessibilityLabel="Clear search"
                >
                  <Icon name="close-circle" color={theme.muted} />
                </TouchableOpacity>
              )}
            </View>

            <View style={s.row}>
              <Text style={s.title}>Supplier Directory</Text>
              <Text style={s.badge}>{filtered.length}</Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={s.supplier}
            onPress={() => navigation.navigate("SupplierForm", {
              supplierId: item.supplierId,
            })}
          >
            <View style={[c.iconBox, s.supplierIcon, {
              backgroundColor: colors[index % colors.length],
            }]}>
              <Icon name="storefront-outline" size={25} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={2}>{item.name}</Text>
              <View style={s.rowSmall}>
                {item.contactNumber && (
                  <Icon name="call-outline" size={14} color={theme.muted} />
                )}
                <Text style={c.subtitle}>
                  {item.contactNumber || "No phone number added"}
                </Text>
              </View>
            </View>

            <View style={[c.iconBox, s.arrow]}>
              <Icon name="chevron-forward" size={20} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={[c.iconBox, s.emptyIcon]}>
              <Icon name="business-outline" size={35} />
            </View>
            <Text style={s.title}>
              {search.trim() ? "No matching suppliers" : "No suppliers yet!"}
            </Text>
            <Text style={[c.subtitle, { textAlign: "center" }]}>
              {search.trim()
                ? "Try another name or phone number."
                : "Start building your supplier directory by adding your first supplier."}
            </Text>
            {!search.trim() && (
              <TouchableOpacity style={[c.button, { marginTop: 20 }]} onPress={add}>
                <Icon name="add" />
                <Text style={c.buttonText}>Add Supplier</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 20,
  },
  rowSmall: {
    flexDirection: "row", alignItems: "center",
    gap: 6, marginTop: 4,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 1.5, color: theme.muted,
  },
  headerIcon: {
    width: 56, height: 56, backgroundColor: theme.purple,
  },
  overview: {
    backgroundColor: theme.blue, padding: 19,
    marginBottom: 25,
  },
  badge: {
    backgroundColor: theme.yellow, borderWidth: 2,
    borderColor: theme.black, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    fontSize: 11, fontWeight: "900",
    color: theme.black, overflow: "hidden",
  },
  number: {
    fontSize: 46, fontWeight: "900",
    color: theme.black, marginTop: 10,
  },
  title: {
    fontSize: 19, fontWeight: "900", color: theme.black,
  },
  small: {
    fontSize: 12, color: theme.black, marginTop: 7,
  },
  add: { marginBottom: 30 },
  supplier: {
    flexDirection: "row", alignItems: "center",
    gap: 12, backgroundColor: theme.white,
    borderWidth: 2, borderColor: theme.black,
    borderRadius: 13, padding: 13, marginBottom: 12,
  },
  supplierIcon: { width: 49, height: 49 },
  name: {
    fontSize: 15, fontWeight: "900", color: theme.black,
  },
  arrow: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: theme.yellow,
  },
  empty: {
    ...c.card, borderStyle: "dashed",
    alignItems: "center", padding: 27,
  },
  emptyIcon: {
    width: 70, height: 70, borderRadius: 16,
    backgroundColor: theme.purple, marginBottom: 17,
  },
});

