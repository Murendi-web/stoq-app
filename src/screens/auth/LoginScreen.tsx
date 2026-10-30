import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { login } from "../../services/authService";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 22 }: {
  name: IconName;
  size?: number;
}) => <Ionicons name={name} size={size} color={theme.black} />;

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (loading) return;

    if (!email.trim() || !password) {
      Alert.alert(
        "Missing Details",
        "Please enter both your email and password."
      );
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      Alert.alert(
        "Login Failed",
        err?.message ?? "Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={c.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.brand}>
          <View style={[c.iconBox, c.shadow, s.logoIcon]}>
            <Icon name="cube-outline" size={42} />
          </View>
          <Text style={s.logo}>
            STOQ<Text style={{ color: theme.pink }}>.</Text>
          </Text>
          <Text style={s.tagline}>
            Smarter stock. Better business.
          </Text>
        </View>

        <View style={[c.card, c.shadow, s.welcome]}>
          <View style={s.welcomeTop}>
            <View style={[c.iconBox, s.welcomeIcon]}>
              <Icon name="storefront-outline" size={29} />
            </View>
            <Text style={s.badge}>WELCOME BACK</Text>
          </View>
          <Text style={s.welcomeTitle}>Let's Get to Work!</Text>
          <Text style={s.description}>
            Sign in to manage your inventory,
            track sales and keep your shop running.
          </Text>
        </View>

        <View style={[c.card, s.form]}>
          <View style={s.formHeading}>
            <Icon name="log-in-outline" size={24} />
            <Text style={s.formTitle}>Log In</Text>
          </View>

          <Text style={s.label}>Email Address</Text>
          <View style={c.inputWrapper}>
            <Icon name="mail-outline" size={21} />
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor="#888888"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="username"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={c.inputWrapper}>
            <Icon name="lock-closed-outline" size={21} />
            <TextInput
              style={s.input}
              placeholder="Enter your password"
              placeholderTextColor="#888888"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              onSubmitEditing={onSubmit}
              returnKeyType="go"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <Icon
                name={showPassword
                  ? "eye-off-outline"
                  : "eye-outline"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={s.forgot}
            onPress={() => navigation.navigate("ForgotPassword")}
            disabled={loading}
          >
            <Text style={s.forgotText}>Forgot Password?</Text>
            <Icon name="arrow-forward" size={15} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[c.button, s.loginButton, loading && s.disabled]}
            onPress={onSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.black} />
            ) : (
              <Icon name="log-in-outline" size={24} />
            )}
            <Text style={s.loginText}>
              {loading ? "Logging In..." : "Log In"}
            </Text>
            {!loading && <Icon name="arrow-forward" />}
          </TouchableOpacity>
        </View>

        <View style={s.register}>
          <View style={[c.iconBox, s.registerIcon]}>
            <Icon name="storefront-outline" size={25} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.registerTitle}>New to STOQ?</Text>
            <Text style={s.registerDescription}>
              Create an account for your shop.
            </Text>
          </View>
          <TouchableOpacity
            style={[c.iconBox, s.registerButton]}
            onPress={() => navigation.navigate("Register")}
            disabled={loading}
          >
            <Icon name="arrow-forward" />
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>STOQ • Inventory made simple</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  content: {
    flexGrow: 1, paddingHorizontal: 20,
    paddingTop: 35, paddingBottom: 35,
    justifyContent: "center",
  },
  brand: { alignItems: "center", marginBottom: 30 },
  logoIcon: {
    width: 80, height: 80, backgroundColor: theme.purple,
    borderWidth: 3, borderRadius: 20,
    shadowOffset: { width: 5, height: 5 }, elevation: 5,
  },
  logo: {
    fontSize: 48, fontWeight: "900", letterSpacing: -2,
    color: theme.black, marginTop: 18,
  },
  tagline: {
    fontSize: 13, fontWeight: "600",
    color: theme.muted, marginTop: 3,
  },
  welcome: {
    backgroundColor: theme.yellow, borderRadius: 16,
    marginBottom: 25,
  },
  welcomeTop: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  welcomeIcon: {
    width: 48, height: 48, backgroundColor: theme.white,
    borderRadius: 12,
  },
  badge: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    fontSize: 10, fontWeight: "900",
    letterSpacing: 0.6, color: theme.black,
    overflow: "hidden",
  },
  welcomeTitle: {
    fontSize: 25, fontWeight: "900", color: theme.black,
  },
  description: {
    fontSize: 13, lineHeight: 20,
    color: theme.black, marginTop: 8,
  },
  form: { borderRadius: 16, marginBottom: 22 },
  formHeading: {
    flexDirection: "row", alignItems: "center",
    gap: 10, marginBottom: 20,
  },
  formTitle: {
    fontSize: 21, fontWeight: "900", color: theme.black,
  },
  label: {
    ...c.label, fontSize: 13, marginBottom: 9,
  },
  input: {
    ...c.input, fontSize: 14,
  },
  forgot: {
    flexDirection: "row", alignItems: "center",
    alignSelf: "flex-end", gap: 5, marginBottom: 23,
  },
  forgotText: {
    fontSize: 12, fontWeight: "800",
    color: theme.black, textDecorationLine: "underline",
  },
  loginButton: { borderRadius: 12, padding: 16 },
  loginText: {
    fontSize: 17, fontWeight: "900", color: theme.black,
  },
  disabled: { opacity: 0.6 },
  register: {
    backgroundColor: theme.blue, borderWidth: 2.5,
    borderColor: theme.black, borderRadius: 14,
    padding: 14, flexDirection: "row",
    alignItems: "center", gap: 12,
  },
  registerIcon: {
    width: 46, height: 46, backgroundColor: theme.white,
    borderRadius: 11,
  },
  registerButton: {
    width: 42, height: 42, backgroundColor: theme.green,
  },
  registerTitle: {
    fontSize: 15, fontWeight: "900", color: theme.black,
  },
  registerDescription: {
    fontSize: 11, color: theme.black, marginTop: 5,
  },
  footer: {
    fontSize: 11, fontWeight: "600",
    color: theme.muted, textAlign: "center", marginTop: 27,
  },
});
