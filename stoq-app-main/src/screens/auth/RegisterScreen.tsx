import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { registerOwner } from "../../services/authService";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 22 }: {
  name: IconName;
  size?: number;
}) => <Ionicons name={name} size={size} color={theme.black} />;

export default function RegisterScreen({ navigation }: any) {
  const [shopName, setShopName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (loading) return;

    const shop = shopName.trim();
    const owner = name.trim();
    const mail = email.trim().toLowerCase();

    if (!shop || !owner || !mail || !password) {
      Alert.alert("Missing Details", "Please fill in every field.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(mail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        "Password Too Short",
        "Your password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);
    try {
      await registerOwner({
        shopName: shop,
        name: owner,
        email: mail,
        password,
      });
      // AuthProvider handles navigation.
    } catch (err: any) {
      Alert.alert("Registration Failed", err?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
  label, value, change, placeholder, ...props
}: {
  label: string;
  value: string;
  change: (text: string) => void;
  placeholder: string;
} & React.ComponentProps<typeof TextInput>) => (
  <View>
    <Text style={s.label}>
      {label} <Text style={{ color: "#B42332" }}>*</Text>
    </Text>
    <TextInput
      style={s.input}
      placeholder={placeholder}
      placeholderTextColor="#888888"
      value={value}
      onChangeText={change}
      {...props}
    />
  </View>
);

  const Heading = ({
    icon, title, color,
  }: {
    icon: IconName;
    title: string;
    color: string;
  }) => (
    <View style={c.sectionHeading}>
      <View style={[c.iconBox, { backgroundColor: color }]}>
        <Icon name={icon} size={23} />
      </View>
      <Text style={c.sectionTitle}>{title}</Text>
    </View>
  );

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
          <View style={[c.iconBox, s.brandIcon]}>
            <Icon name="cube-outline" size={29} />
          </View>
          <Text style={s.logo}>
            STOQ<Text style={{ color: theme.pink }}>.</Text>
          </Text>
        </View>

        <Text style={s.eyebrow}>LET'S GET STARTED</Text>
        <Text style={[c.heading, { fontSize: 30 }]}>
          Create Your Shop
        </Text>
        <Text style={[c.subtitle, { marginBottom: 25 }]}>
          Set up your STOQ account and start managing your business.
        </Text>

        <View style={[c.card, c.shadow, s.welcome]}>
          <View style={s.topRow}>
            <View style={[c.iconBox, s.whiteIcon]}>
              <Icon name="storefront-outline" size={29} />
            </View>
            <Text style={s.badge}>NEW SHOP</Text>
          </View>
          <Text style={s.welcomeTitle}>Your Business, Organised!</Text>
          <Text style={s.description}>
            Create your shop workspace to track products,
            sales, restocks and stock alerts.
          </Text>
        </View>

        <View style={c.card}>
          <Heading
            icon="business-outline"
            title="Shop Information"
            color={theme.blue}
          />
          <Field
            label="Shop Name"
            placeholder="e.g. My Corner Store"
            value={shopName}
            change={setShopName}
            autoCapitalize="words"
            maxLength={100}
            editable={!loading}
          />
          <Text style={s.helper}>
            This will be the name of your shop workspace.
          </Text>
        </View>

        <View style={c.card}>
          <Heading
            icon="person-outline"
            title="Owner Information"
            color={theme.purple}
          />
          <Field
            label="Your Name"
            placeholder="Your full name"
            value={name}
            change={setName}
            autoCapitalize="words"
            autoComplete="name"
          />
          <Field
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            change={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View style={[c.card, s.security]}>
          <Heading
            icon="lock-closed-outline"
            title="Secure Your Account"
            color={theme.white}
          />

          <Text style={s.label}>
            Password <Text style={{ color: "#B42332" }}>*</Text>
          </Text>

          <View style={s.passwordRow}>
            <TextInput
              style={s.passwordInput}
              placeholder="At least 6 characters"
              placeholderTextColor="#888888"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
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
                size={23}
              />
            </TouchableOpacity>
          </View>

          <View style={s.hintRow}>
            <Icon name="shield-checkmark-outline" size={18} />
            <Text style={s.hint}>
              Use a strong password to protect your shop account.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[c.button, s.createButton, loading && { opacity: 0.6 }]}
          onPress={onSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={theme.black} />
          ) : (
            <Icon name="storefront-outline" size={24} />
          )}
          <Text style={s.createText}>
            {loading ? "Creating Your Shop..." : "Create My Shop"}
          </Text>
          {!loading && <Icon name="arrow-forward" />}
        </TouchableOpacity>

        <View style={s.loginCard}>
          <View style={[c.iconBox, s.loginIcon]}>
            <Icon name="log-in-outline" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.bold}>Already have an account?</Text>
            <Text style={s.small}>Sign in to your existing shop.</Text>
          </View>
          <TouchableOpacity
            style={[c.iconBox, s.loginArrow]}
            onPress={() => navigation.navigate("Login")}
            disabled={loading}
          >
            <Icon name="arrow-forward" size={21} />
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>
          STOQ • Smarter stock. Better business.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  content: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  brand: {
    flexDirection: "row", alignItems: "center",
    gap: 11, marginTop: 15, marginBottom: 28,
  },
  brandIcon: {
    width: 48, height: 48, backgroundColor: theme.purple,
    borderWidth: 2.5, borderRadius: 12,
  },
  logo: {
    fontSize: 29, fontWeight: "900",
    letterSpacing: -1, color: theme.black,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900", letterSpacing: 1.5,
    color: theme.muted, marginBottom: 7,
  },
  welcome: {
    backgroundColor: theme.yellow,
    borderRadius: 16, marginBottom: 27,
  },
  topRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  whiteIcon: {
    width: 49, height: 49, backgroundColor: theme.white,
    borderRadius: 12,
  },
  badge: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    fontSize: 10, fontWeight: "900", color: theme.black,
    overflow: "hidden",
  },
  welcomeTitle: {
    fontSize: 23, fontWeight: "900", color: theme.black,
  },
  description: {
    fontSize: 13, lineHeight: 20,
    color: theme.black, marginTop: 8,
  },
  label: {
    ...c.label, fontSize: 13, marginTop: 9,
  },
  input: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 11,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: theme.black, marginBottom: 9,
  },
  helper: {
    fontSize: 11, color: theme.muted,
    lineHeight: 17, marginTop: 3,
  },
  security: {
    backgroundColor: theme.purple, marginBottom: 26,
  },
  passwordRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 11,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1, paddingVertical: 13,
    fontSize: 15, color: theme.black,
  },
  hintRow: {
    flexDirection: "row", alignItems: "center",
    gap: 9, marginTop: 14,
  },
  hint: {
    flex: 1, fontSize: 12, color: theme.black, lineHeight: 18,
  },
  createButton: { marginBottom: 25 },
  createText: {
    fontSize: 17, fontWeight: "900", color: theme.black,
  },
  loginCard: {
    backgroundColor: theme.blue, borderWidth: 2.5,
    borderColor: theme.black, borderRadius: 14,
    padding: 14, flexDirection: "row",
    alignItems: "center", gap: 12,
  },
  loginIcon: {
    width: 45, height: 45, backgroundColor: theme.white,
  },
  loginArrow: {
    width: 42, height: 42, backgroundColor: theme.green,
  },
  bold: { fontSize: 14, fontWeight: "900", color: theme.black },
  small: { fontSize: 11, color: theme.black, marginTop: 5 },
  footer: {
    fontSize: 11, fontWeight: "600",
    color: theme.muted, textAlign: "center", marginTop: 28,
  },
});
