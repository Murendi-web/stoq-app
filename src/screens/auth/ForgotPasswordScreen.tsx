
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { requestPasswordReset } from "../../services/authService";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 22 }: { name: IconName; size?: number }) => (
  <Ionicons name={name} size={size} color={theme.black} />
);

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const cleanEmail = email.trim().toLowerCase();
  const login = () => navigation.navigate("Login");

  const submit = async () => {
    if (loading) return;

    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(cleanEmail);
    } catch {
      // Do not reveal whether the account exists.
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  const Button = ({
    title, icon, onPress, disabled = false,
  }: {
    title: string;
    icon: IconName;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[c.button, s.button, disabled && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={disabled}
    >
      {disabled ? (
        <ActivityIndicator color={theme.black} />
      ) : (
        <Icon name={icon} />
      )}
      <Text style={c.buttonText}>{title}</Text>
      {!disabled && <Icon name="arrow-forward" size={20} />}
    </TouchableOpacity>
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

        {sent ? (
          <>
            <View style={[c.card, c.shadow, s.success]}>
              <View style={[c.iconBox, s.bigIcon]}>
                <Icon name="mail-open-outline" size={42} />
              </View>

              <Text style={s.badge}>REQUEST SUBMITTED</Text>
              <Text style={s.title}>Check Your Email!</Text>

              <Text style={s.centerText}>
                If an account exists for this email,
                a password reset link will be sent.
              </Text>

              <View style={s.emailBox}>
                <Icon name="mail-outline" size={19} />
                <Text style={s.emailText}>{cleanEmail}</Text>
              </View>
            </View>

            <View style={c.card}>
              <Text style={c.sectionTitle}>What Happens Next?</Text>
              {[
                "Open your email inbox.",
                "Look for the reset email. Check spam too.",
                "Follow the link to set a new password.",
              ].map((step, i) => (
                <View key={i} style={s.step}>
                  <View style={[c.iconBox, s.number]}>
                    <Text style={s.bold}>{i + 1}</Text>
                  </View>
                  <Text style={s.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <Button
              title="Back to Log In"
              icon="log-in-outline"
              onPress={login}
            />

            <TouchableOpacity
              style={s.textButton}
              onPress={() => setSent(false)}
            >
              <Icon name="create-outline" size={18} />
              <Text style={s.underlined}>Try Another Email</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.eyebrow}>ACCOUNT RECOVERY</Text>
            <Text style={c.heading}>Forgot Password?</Text>
            <Text style={[c.subtitle, s.subtitle]}>
              No worries! We'll help you get back into your STOQ account.
            </Text>

            <View style={[c.card, c.shadow, s.welcome]}>
              <View style={s.topRow}>
                <View style={[c.iconBox, s.whiteIcon]}>
                  <Icon name="key-outline" size={29} />
                </View>
                <Text style={s.badge}>PASSWORD RESET</Text>
              </View>

              <Text style={s.welcomeTitle}>
                Let's Get You Back In!
              </Text>
              <Text style={s.description}>
                Enter your registered email address and we'll
                send you a password reset link.
              </Text>
            </View>

            <View style={c.card}>
              <View style={c.sectionHeading}>
                <View style={[c.iconBox, { backgroundColor: theme.blue }]}>
                  <Icon name="mail-outline" />
                </View>
                <Text style={c.sectionTitle}>Your Email</Text>
              </View>

              <Text style={c.label}>Email Address</Text>
              <View style={c.inputWrapper}>
                <Icon name="mail-outline" size={20} />
                <TextInput
                  style={c.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!loading}
                  returnKeyType="send"
                  onSubmitEditing={submit}
                />
              </View>

              <Text style={c.subtitle}>
                Use the email address you registered with STOQ.
              </Text>
            </View>

            <Button
              title={loading ? "Sending..." : "Send Reset Link"}
              icon="send-outline"
              onPress={submit}
              disabled={loading}
            />

            <TouchableOpacity
              style={s.backCard}
              onPress={login}
              disabled={loading}
            >
              <Icon name="arrow-back" />
              <View style={{ flex: 1 }}>
                <Text style={s.bold}>Remember Your Password?</Text>
                <Text style={s.small}>Return to the login screen.</Text>
              </View>
              <Icon name="chevron-forward" size={19} />
            </TouchableOpacity>
          </>
        )}

        <Text style={s.footer}>
          STOQ • Smarter stock. Better business.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  content: {
    flexGrow: 1, padding: 20, paddingBottom: 40,
    justifyContent: "center",
  },
  brand: {
    flexDirection: "row", alignItems: "center",
    gap: 11, marginTop: 15, marginBottom: 32,
  },
  brandIcon: {
    width: 48, height: 48, backgroundColor: theme.purple,
  },
  logo: {
    fontSize: 29, fontWeight: "900", color: theme.black,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900", letterSpacing: 1.5,
    color: theme.muted, marginBottom: 7,
  },
  subtitle: { marginBottom: 27, lineHeight: 20 },
  welcome: { backgroundColor: theme.yellow, marginBottom: 26 },
  topRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 17,
  },
  whiteIcon: { backgroundColor: theme.white, width: 49, height: 49 },
  badge: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    fontSize: 10, fontWeight: "900", color: theme.black,
  },
  welcomeTitle: {
    fontSize: 23, fontWeight: "900", color: theme.black,
  },
  description: {
    fontSize: 13, color: theme.black,
    lineHeight: 20, marginTop: 8,
  },
  button: { marginBottom: 25 },
  backCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: theme.blue, borderWidth: 2,
    borderColor: theme.black, borderRadius: 14, padding: 17,
  },
  bold: { fontWeight: "900", color: theme.black, fontSize: 14 },
  small: { fontSize: 11, color: theme.black, marginTop: 5 },
  success: {
    backgroundColor: theme.green, alignItems: "center",
    padding: 23, marginBottom: 24,
  },
  bigIcon: {
    width: 82, height: 82, backgroundColor: theme.white,
    borderRadius: 20, marginBottom: 17,
  },
  title: {
    fontSize: 25, fontWeight: "900", color: theme.black,
    textAlign: "center", marginTop: 18,
  },
  centerText: {
    fontSize: 13, color: theme.black, lineHeight: 20,
    textAlign: "center", marginVertical: 17,
  },
  emailBox: {
    flexDirection: "row", alignItems: "center", gap: 9,
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 10,
    padding: 12, width: "100%",
  },
  emailText: {
    flex: 1, fontSize: 13, fontWeight: "800", color: theme.black,
  },
  step: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginTop: 15,
  },
  number: {
    width: 30, height: 30, backgroundColor: theme.yellow,
    borderRadius: 8,
  },
  stepText: { flex: 1, fontSize: 12, color: theme.black },
  textButton: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 8,
  },
  underlined: {
    fontSize: 13, fontWeight: "800", color: theme.black,
    textDecorationLine: "underline",
  },
  footer: {
    fontSize: 11, color: theme.muted, fontWeight: "600",
    textAlign: "center", marginTop: 28,
  },
});

