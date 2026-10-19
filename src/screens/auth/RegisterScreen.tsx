import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { registerOwner } from "../../services/authService";
import { colors } from "../../theme/colors";

export default function RegisterScreen({ navigation }: any) {
  const [shopName, setShopName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    console.log("DEBUG: onSubmit fired", { shopName, name, email });

    if (!shopName || !name || !email || !password) {
      Alert.alert("Missing details", "Please fill in every field.");
      return;
    }
    setLoading(true);
    try {
      console.log("DEBUG: calling registerOwner...");
      await registerOwner({ shopName, name, email: email.trim(), password });
      console.log("DEBUG: registerOwner finished successfully");
      // onAuthStateChanged in AuthProvider takes it from here.
    } catch (err: any) {
      console.log("DEBUG: registerOwner threw an error:", err);
      Alert.alert("Registration failed", err.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Set up your shop</Text>
      <Text style={styles.subtitle}>This creates your Stoq account and your shop's workspace.</Text>

      <TextInput style={styles.input} placeholder="Shop name" value={shopName} onChangeText={setShopName} />
      <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Creating..." : "Create Shop"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: "800", color: colors.primary, textAlign: "center" },
  subtitle: { fontSize: 13, color: colors.muted, textAlign: "center", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.backgroundMuted,
  },
  button: { backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700" },
  link: { color: colors.primary, textAlign: "center", marginTop: 20 },
});