import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  addSupplier, updateSupplier, deleteSupplier, subscribeToSuppliers,
} from "../../services/supplierService";
import { theme, commonStyles as c } from "../../theme/styles";

const Icon = ({ name }: { name: React.ComponentProps<typeof Ionicons>["name"] }) =>
  <Ionicons name={name} size={23} color={theme.black} />;

export default function SupplierFormScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const supplierId: string | undefined = route.params?.supplierId;
  const editing = Boolean(supplierId);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const loadedId = useRef<string | null>(null);
  const busy = saving || deleting;

  useEffect(() => {
    if (!user?.shopId || !supplierId) return;

    return subscribeToSuppliers(user.shopId, (suppliers) => {
      const supplier = suppliers.find((s) => s.supplierId === supplierId);
      if (!supplier || loadedId.current === supplierId) return;

      setName(supplier.name);
      setPhone(supplier.contactNumber ?? "");
      loadedId.current = supplierId;
    });
  }, [user?.shopId, supplierId]);

  const onSave = async () => {
    if (busy) return;

    if (!user) {
      Alert.alert("Not signed in", "Please sign in before saving a supplier.");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Missing details", "Please enter the supplier's name.");
      return;
    }

    setSaving(true);
    try {
      const data = { name: name.trim(), contactNumber: phone.trim() };

      if (supplierId) await updateSupplier(user.shopId, supplierId, data);
      else await addSupplier(user.shopId, data);

      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Could not save supplier", error?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!user || !supplierId || busy) return;

    Alert.alert("Delete Supplier", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteSupplier(user.shopId, supplierId);
            navigation.goBack();
          } catch (error: any) {
            Alert.alert("Could not delete supplier", error?.message ?? "Please try again.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const fields = [
    {
      title: "Basic Information", icon: "business-outline" as const,
      label: "Supplier Name *", value: name, change: setName,
      placeholder: "e.g. ABC Wholesale", help: "Enter the business or supplier name.",
      color: theme.white, maxLength: 100,
    },
    {
      title: "Contact Information", icon: "call-outline" as const,
      label: "Contact Number", value: phone, change: setPhone,
      placeholder: "e.g. 081 234 5678",
      help: "Optional — add a number to contact your supplier.",
      color: theme.purple, maxLength: 25,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={c.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={c.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.eyebrow}>STOQ PARTNERS</Text>
            <Text style={c.heading}>
              {editing ? "Edit Supplier" : "Add Supplier"}
            </Text>
            <Text style={c.subtitle}>
              {editing
                ? "Update your supplier's information."
                : "Add a new supplier to your network."}
            </Text>
          </View>
          <View style={[c.iconBox, { backgroundColor: theme.purple, width: 56, height: 56 }]}>
            <Icon name={editing ? "create-outline" : "person-add-outline"} />
          </View>
        </View>

        <View style={[c.card, s.row, { backgroundColor: theme.yellow }]}>
          <View style={[c.iconBox, { backgroundColor: theme.white }]}>
            <Icon name="storefront-outline" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Supplier Details</Text>
            <Text style={c.subtitle}>
              Keep your supplier contacts organised and easy to find.
            </Text>
          </View>
        </View>

        {fields.map((field) => (
          <View key={field.title} style={[c.card, { backgroundColor: field.color }]}>
            <View style={s.row}>
              <View style={[c.iconBox, {
                backgroundColor: field.icon === "business-outline"
                  ? theme.blue : theme.white,
              }]}>
                <Icon name={field.icon} />
              </View>
              <Text style={s.title}>{field.title}</Text>
            </View>

            <Text style={c.label}>{field.label}</Text>
            <TextInput
              style={s.input}
              value={field.value}
              onChangeText={field.change}
              placeholder={field.placeholder}
              placeholderTextColor="#888"
              maxLength={field.maxLength}
              editable={!busy}
              autoCapitalize={field.icon === "business-outline" ? "words" : "none"}
              keyboardType={field.icon === "call-outline" ? "phone-pad" : "default"}
              autoComplete={field.icon === "call-outline" ? "tel" : "off"}
            />
            <Text style={s.help}>{field.help}</Text>
          </View>
        ))}

        <View style={[c.card, s.row, { backgroundColor: theme.blue }]}>
          <Icon name="bulb-outline" />
          <Text style={{ flex: 1, fontSize: 12, color: theme.black }}>
            {editing
              ? "Changes will update this supplier in your STOQ directory."
              : "Your new supplier will appear in your supplier directory after saving."}
          </Text>
        </View>

        <TouchableOpacity
          style={[c.button, busy && { opacity: 0.55 }]}
          onPress={onSave}
          disabled={busy}
        >
          {saving ? <ActivityIndicator color={theme.black} /> :
            <Icon name="checkmark-circle-outline" />}
          <Text style={c.buttonText}>
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Supplier"}
          </Text>
          {!saving && <Icon name="arrow-forward" />}
        </TouchableOpacity>

        {editing && (
          <TouchableOpacity
            style={[c.button, {
              backgroundColor: theme.pink, marginTop: 20,
              opacity: busy ? 0.55 : 1,
            }]}
            onPress={onDelete}
            disabled={busy}
          >
            {deleting ? <ActivityIndicator color={theme.black} /> :
              <Icon name="trash-outline" />}
            <Text style={c.buttonText}>
              {deleting ? "Deleting..." : "Delete Supplier"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 18,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 1.5, color: theme.muted,
  },
  title: {
    fontSize: 17, fontWeight: "900", color: theme.black,
  },
  input: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 11,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: theme.black,
  },
  help: {
    fontSize: 11, color: theme.black, marginTop: 9,
  },
});
