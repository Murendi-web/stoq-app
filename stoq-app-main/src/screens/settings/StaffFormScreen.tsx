import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { registerStaff } from "../../services/authService";
import { theme, commonStyles as c } from "../../theme/styles";

export default function StaffFormScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (loading || success) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName)
      return Alert.alert("Missing Name", "Please enter the staff member's name.");

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail))
      return Alert.alert("Invalid Email", "Please enter a valid email address.");

    if (password.length < 6)
      return Alert.alert("Invalid Password", "Password must be at least 6 characters long.");

    if (!user?.shopId)
      return Alert.alert("Error", "Your shop could not be identified.");

    setLoading(true);
    try {
      await registerStaff({
        name: cleanName,
        email: cleanEmail,
        password,
        shopId: user.shopId,
      });
      setSuccess(true);
      setPassword("");
    } catch (error: any) {
      Alert.alert("Registration Failed", error?.message || "Unable to create the staff account.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, icon, value, onChangeText, ...props
  }: any) => (
    <>
      <Text style={c.label}>{label}</Text>
      <View style={c.inputWrapper}>
        <Ionicons name={icon} size={20} color={theme.black} />
        <TextInput
          style={c.input}
          value={value}
          onChangeText={onChangeText}
          editable={!loading}
          placeholderTextColor="#888888"
          {...props}
        />
      </View>
    </>
  );

  const SectionTitle = ({ icon, title, background }: any) => (
    <View style={c.sectionHeading}>
      <View style={[c.iconBox, { backgroundColor: background }]}>
        <Ionicons name={icon} size={22} color={theme.black} />
      </View>
      <Text style={c.sectionTitle}>{title}</Text>
    </View>
  );

  if (success) {
    return (
      <View style={[c.screen, s.successScreen]}>
        <View style={[c.card, c.shadow, s.successCard]}>
          <View style={s.successIcon}>
            <Ionicons name="checkmark-circle-outline" size={52} color={theme.black} />
          </View>
          <Text style={s.successTitle}>Staff Added!</Text>
          <Text style={s.successDescription}>
            The staff account for {name.trim()} has been created.
          </Text>
          <View style={s.successEmail}>
            <Ionicons name="mail-outline" size={19} color={theme.black} />
            <Text style={s.emailText}>{email.trim().toLowerCase()}</Text>
          </View>
        </View>

        <TouchableOpacity style={c.button} onPress={() => navigation.goBack()}>
          <Ionicons name="people-outline" size={21} color={theme.black} />
          <Text style={c.buttonText}>Back to Staff Management</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={c.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={c.content} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.eyebrow}>TEAM MANAGEMENT</Text>
            <Text style={c.heading}>Add Staff</Text>
            <Text style={c.subtitle}>
              Create an account for a new team member.
            </Text>
          </View>
          <View style={s.headerIcon}>
            <Ionicons name="person-add-outline" size={28} color={theme.black} />
          </View>
        </View>

        <View style={[c.card, c.shadow, s.introCard]}>
          <View style={s.introBadge}>
            <Ionicons name="people-outline" size={19} color={theme.black} />
            <Text style={s.badgeText}>GROW YOUR TEAM</Text>
          </View>
          <Text style={s.introTitle}>Welcome a New Team Member!</Text>
          <Text style={s.introDescription}>
            Set up their account so they can access STOQ and help manage your shop.
          </Text>
        </View>

        <View style={c.card}>
          <SectionTitle icon="person-outline" title="Personal Details" background={theme.blue} />

          <Field
            label="Full Name"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            placeholder="Staff member's full name"
            autoCapitalize="words"
          />

          <Field
            label="Email Address"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="staff@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={[c.card, { backgroundColor: theme.purple, marginBottom: 27 }]}>
          <SectionTitle icon="lock-closed-outline" title="Account Security" background={theme.white} />

          <Text style={c.label}>Temporary Password</Text>
          <View style={c.inputWrapper}>
            <Ionicons name="key-outline" size={20} color={theme.black} />
            <TextInput
              style={c.input}
              placeholder="At least 6 characters"
              placeholderTextColor="#888888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={theme.black}
              />
            </TouchableOpacity>
          </View>

          <View style={s.passwordInfo}>
            <Ionicons name="information-circle-outline" size={19} color={theme.black} />
            <Text style={s.passwordInfoText}>
              Use a password with at least 6 characters. Share it securely with the staff member.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[c.button, { marginBottom: 22 }, loading && { opacity: 0.6 }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={theme.black} />
          ) : (
            <Ionicons name="person-add-outline" size={22} color={theme.black} />
          )}
          <Text style={c.buttonText}>
            {loading ? "Creating Account..." : "Create Staff Account"}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={20} color={theme.black} />}
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
          <Ionicons name="arrow-back-outline" size={19} color={theme.black} />
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={s.footer}>STOQ • Team Management</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 24,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900", color: theme.muted,
    letterSpacing: 1.4, marginBottom: 6,
  },
  headerIcon: {
    width: 56, height: 56, backgroundColor: theme.pink,
    borderWidth: 2.5, borderColor: theme.black, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  introCard: {
    backgroundColor: theme.yellow, borderRadius: 16,
    padding: 19, marginBottom: 25,
  },
  introBadge: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center",
    gap: 8, backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 9,
    paddingHorizontal: 11, paddingVertical: 8, marginBottom: 16,
  },
  badgeText: {
    fontSize: 10, fontWeight: "900", color: theme.black,
  },
  introTitle: {
    fontSize: 22, fontWeight: "900", color: theme.black, lineHeight: 28,
  },
  introDescription: {
    fontSize: 13, color: theme.black, lineHeight: 20, marginTop: 9,
  },
  passwordInfo: {
    flexDirection: "row", alignItems: "flex-start", gap: 9,
  },
  passwordInfoText: {
    flex: 1, fontSize: 12, color: theme.black, lineHeight: 18,
  },
  cancelButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  cancelText: {
    fontSize: 13, fontWeight: "800", color: theme.black,
  },
  footer: {
    fontSize: 11, color: theme.muted, fontWeight: "600",
    textAlign: "center", marginTop: 30,
  },
  successScreen: {
    justifyContent: "center", padding: 22,
  },
  successCard: {
    backgroundColor: theme.green, borderRadius: 17,
    padding: 23, alignItems: "center", marginBottom: 27,
  },
  successIcon: {
    width: 90, height: 90, backgroundColor: theme.white,
    borderWidth: 2, borderColor: theme.black, borderRadius: 20,
    alignItems: "center", justifyContent: "center", marginBottom: 19,
  },
  successTitle: {
    fontSize: 25, fontWeight: "900", color: theme.black,
  },
  successDescription: {
    fontSize: 13, color: theme.black, textAlign: "center",
    lineHeight: 20, marginTop: 10, marginBottom: 18,
  },
  successEmail: {
    width: "100%", flexDirection: "row", alignItems: "center",
    gap: 9, backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 10, padding: 12,
  },
  emailText: {
    flex: 1, fontSize: 13, fontWeight: "800", color: theme.black,
  },
});
