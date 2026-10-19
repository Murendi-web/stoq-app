import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { registerStaff } from "../../services/authService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { colors } from "../../theme/colors";

export default function StaffFormScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (!name.trim()) return "Enter the staff member's name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const onSave = async () => {
    if (!user) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await registerStaff({ name: name.trim(), email: email.trim(), password, shopId: user.shopId });
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 900);
    } catch (err: any) {
      setError(err.message ?? "Could not create the staff account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Staff Member</Text>
      <Text style={styles.subtitle}>
        This creates a login for them under your shop. Share the email and password with them directly.
      </Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Staff member's name" />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="staff@example.com"
      />

      <Text style={styles.label}>Temporary password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="At least 6 characters"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>Staff account created ✓</Text> : null}

      {loading ? (
        <LoadingSpinner label="Creating account..." />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Create Staff Account</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: 20, fontWeight: "800", color: colors.primary, marginBottom: 6 },
  subtitle: { fontSize: 12, color: colors.muted, marginBottom: 20 },
  label: { fontSize: 12, color: colors.text, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, backgroundColor: colors.backgroundMuted },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 14 },
  successText: { color: colors.success, fontSize: 13, fontWeight: "700", marginTop: 14, textAlign: "center" },
  saveButton: { backgroundColor: colors.success, borderRadius: 8, padding: 14, alignItems: "center", marginTop: 24 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
});
