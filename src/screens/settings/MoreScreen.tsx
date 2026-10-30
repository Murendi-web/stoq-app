import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/authService";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 23 }: {
  name: IconName; size?: number;
}) => <Ionicons name={name} size={size} color={theme.black} />;

export default function MoreScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const isOwner = user?.role === "owner";
  const displayName = user?.name?.trim() || "STOQ User";
  const initials = displayName.split(/\s+/).slice(0, 2)
    .map((word) => word[0].toUpperCase()).join("");

  const menus: {
    title: string; description: string;
    icon: IconName; color: string; route: string;
  }[] = [
    {
      title: "Manage Suppliers",
      description: "View, add and update your suppliers.",
      icon: "business-outline",
      color: theme.blue,
      route: "Suppliers",
    },
    ...(isOwner ? [{
      title: "Manage Staff",
      description: "Add and manage team members.",
      icon: "people-outline" as IconName,
      color: theme.purple,
      route: "StaffManagement",
    }] : []),
  ];

  const handleLogout = () => {
    if (loggingOut) return;

    Alert.alert(
      "Log Out?",
      "Are you sure you want to sign out of STOQ?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch (err: any) {
              Alert.alert(
                "Could not log out",
                err?.message ?? "Please try again."
              );
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={c.screen} contentContainerStyle={c.content}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>STOQ ACCOUNT</Text>
          <Text style={c.heading}>More & Settings</Text>
          <Text style={c.subtitle}>Manage your shop and account.</Text>
        </View>
        <View style={[c.iconBox, s.headerIcon]}>
          <Icon name="settings-outline" size={28} />
        </View>
      </View>

      <View style={[c.card, c.shadow, s.profile]}>
        <View style={s.row}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>

          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <Text style={s.eyebrow}>SIGNED IN AS</Text>
            <Text style={s.profileName} numberOfLines={2}>
              {displayName}
            </Text>
            <View style={s.roleBadge}>
              <Icon
                name={isOwner
                  ? "shield-checkmark-outline"
                  : "person-outline"}
                size={15}
              />
              <Text style={s.roleText}>
                {isOwner ? "Shop Owner" : "Staff Member"}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.row}>
          <Icon name="storefront-outline" size={18} />
          <Text style={[s.roleText, { flex: 1 }]}>
            STOQ Shop Account
          </Text>
          <Icon name="checkmark-circle" size={19} />
        </View>
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Shop Management</Text>
        <Text style={[s.badge, { backgroundColor: theme.green }]}>
          TOOLS
        </Text>
      </View>

      {menus.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={s.menuCard}
          onPress={() => navigation.navigate(item.route)}
          activeOpacity={0.8}
        >
          <View style={[c.iconBox, s.menuIcon, {
            backgroundColor: item.color,
          }]}>
            <Icon name={item.icon} size={26} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.menuTitle}>{item.title}</Text>
            <Text style={c.subtitle}>{item.description}</Text>
          </View>
          <Icon name="chevron-forward" />
        </TouchableOpacity>
      ))}

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Account</Text>
        <Text style={[s.badge, { backgroundColor: theme.yellow }]}>
          PROFILE
        </Text>
      </View>

      <View style={[s.menuCard, s.infoCard]}>
        <View style={[c.iconBox, { backgroundColor: theme.white }]}>
          <Icon name="information-circle-outline" size={24} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.menuTitle}>Your STOQ Account</Text>
          <Text style={s.infoText}>
            You're signed in as a {isOwner ? "shop owner" : "staff member"}.
            Your available management tools depend on your account role.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[c.button, s.logout, loggingOut && { opacity: 0.55 }]}
        onPress={handleLogout}
        disabled={loggingOut}
        activeOpacity={0.8}
      >
        {loggingOut ? (
          <ActivityIndicator color={theme.black} />
        ) : (
          <Icon name="log-out-outline" size={24} />
        )}
        <Text style={s.logoutText}>
          {loggingOut ? "Logging Out..." : "Log Out"}
        </Text>
        {!loggingOut && <Icon name="arrow-forward" size={21} />}
      </TouchableOpacity>

      <View style={s.footer}>
        <Text style={s.footerBrand}>STOQ</Text>
        <Text style={c.subtitle}>
          Smarter stock. Better business.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginTop: 8, marginBottom: 26,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900", letterSpacing: 1.5,
    color: theme.muted, marginBottom: 5,
  },
  headerIcon: {
    width: 56, height: 56, backgroundColor: theme.purple,
    borderWidth: 2.5, borderRadius: 14,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 15 },
  profile: {
    backgroundColor: theme.yellow,
    borderRadius: 16, marginBottom: 32,
  },
  avatar: {
    width: 65, height: 65, backgroundColor: theme.purple,
    borderWidth: 2.5, borderColor: theme.black,
    borderRadius: 15, alignItems: "center", justifyContent: "center",
  },
  avatarText: {
    fontSize: 23, fontWeight: "900", color: theme.black,
  },
  profileName: {
    fontSize: 22, fontWeight: "900",
    color: theme.black, marginBottom: 9,
  },
  roleBadge: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 8,
    paddingHorizontal: 9, paddingVertical: 6,
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  roleText: { fontSize: 11, fontWeight: "900", color: theme.black },
  divider: {
    height: 2, backgroundColor: theme.black,
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 21, fontWeight: "900", color: theme.black,
  },
  badge: {
    borderWidth: 2, borderColor: theme.black,
    borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 5, fontSize: 10, fontWeight: "900",
    color: theme.black, overflow: "hidden",
  },
  menuCard: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 14,
    padding: 15, flexDirection: "row",
    alignItems: "center", gap: 13, marginBottom: 14,
  },
  menuIcon: { width: 52, height: 52, borderRadius: 12 },
  menuTitle: {
    fontSize: 15, fontWeight: "900", color: theme.black,
  },
  infoCard: {
    backgroundColor: theme.blue, marginBottom: 26,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 12, color: theme.black,
    lineHeight: 18, marginTop: 6,
  },
  logout: { backgroundColor: theme.pink },
  logoutText: {
    fontSize: 17, fontWeight: "900", color: theme.black,
  },
  footer: { alignItems: "center", marginTop: 42 },
  footerBrand: {
    fontSize: 23, fontWeight: "900",
    color: theme.black, letterSpacing: 2,
  },
});
