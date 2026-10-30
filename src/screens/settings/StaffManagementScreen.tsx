import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { subscribeToStaff, removeStaff } from "../../services/authService";
import { AppUser } from "../../types";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 23 }: {
  name: IconName; size?: number;
}) => <Ionicons name={name} size={size} color={theme.black} />;

const colors = [
  theme.purple, theme.blue, theme.green,
  theme.yellow, theme.pink,
];

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase()).join("");

export default function StaffManagementScreen({ navigation }: any) {
  const { user } = useAuth();
  const [staff, setStaff] = useState<AppUser[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.shopId) return;
    return subscribeToStaff(user.shopId, setStaff);
  }, [user?.shopId]);

  const addStaff = () => navigation.navigate("StaffForm");

  const onRemove = (member: AppUser) => {
    if (removingId) return;

    Alert.alert(
      "Remove Staff Member",
      `Are you sure you want to remove ${member.name} from this shop?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingId(member.userId);
            try {
              await removeStaff(member.userId);
            } catch (err: any) {
              Alert.alert(
                "Could not remove staff member",
                err?.message ?? "Please try again."
              );
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={c.screen}>
      <FlatList
        data={staff}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={[c.content, { flexGrow: 1 }]}
        ListHeaderComponent={
          <>
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.eyebrow}>STOQ TEAM</Text>
                <Text style={c.heading}>Staff Management</Text>
                <Text style={c.subtitle}>
                  Manage the people working in your shop.
                </Text>
              </View>
              <View style={[c.iconBox, s.headerIcon]}>
                <Icon name="people-outline" size={28} />
              </View>
            </View>

            <View style={[c.card, c.shadow, s.overview]}>
              <View style={s.between}>
                <View style={[c.iconBox, s.whiteIcon]}>
                  <Icon name="people" size={27} />
                </View>
                <Text style={s.badge}>YOUR TEAM</Text>
              </View>

              <Text style={s.count}>{staff.length}</Text>
              <Text style={s.overviewTitle}>Team Members</Text>
              <Text style={s.small}>
                Staff accounts associated with your shop.
              </Text>
            </View>

            <TouchableOpacity
              style={[c.button, s.addButton]}
              onPress={addStaff}
              activeOpacity={0.8}
            >
              <Icon name="person-add-outline" size={24} />
              <Text style={[c.buttonText, { flex: 1 }]}>
                Add Staff Member
              </Text>
              <Icon name="arrow-forward" />
            </TouchableOpacity>

            <View style={s.section}>
              <Text style={s.sectionTitle}>Your Team</Text>
              <Text style={[s.badge, { backgroundColor: theme.blue }]}>
                {staff.length}
              </Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          const removing = removingId === item.userId;

          return (
            <View style={[c.card, s.staffCard]}>
              <View style={s.staffRow}>
                <View style={[s.avatar, {
                  backgroundColor: colors[index % colors.length],
                }]}>
                  <Text style={s.avatarText}>
                    {initials(item.name)}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.staffName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={s.emailRow}>
                    <Ionicons
                      name="mail-outline"
                      size={14}
                      color={theme.muted}
                    />
                    <Text style={s.email} numberOfLines={2}>
                      {item.email}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={s.divider} />

              <View style={s.between}>
                <View style={s.role}>
                  <Icon name="shield-checkmark-outline" size={15} />
                  <Text style={s.roleText}>
                    {item.role === "owner" ? "Owner" : "Staff"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[s.remove, removing && { opacity: 0.55 }]}
                  onPress={() => onRemove(item)}
                  disabled={Boolean(removingId)}
                  activeOpacity={0.8}
                >
                  {removing ? (
                    <ActivityIndicator size="small" color={theme.black} />
                  ) : (
                    <Icon name="trash-outline" size={17} />
                  )}
                  <Text style={s.roleText}>
                    {removing ? "Removing..." : "Remove"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={[c.iconBox, s.emptyIcon]}>
              <Icon name="people-outline" size={36} />
            </View>

            <Text style={s.emptyTitle}>No staff members yet!</Text>
            <Text style={[c.subtitle, { textAlign: "center" }]}>
              Add a staff member so they can help manage your shop
              without using your owner account.
            </Text>

            <TouchableOpacity
              style={s.emptyButton}
              onPress={addStaff}
            >
              <Icon name="add" size={20} />
              <Text style={s.roleText}>
                Add Your First Staff Member
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginTop: 8, marginBottom: 26,
  },
  eyebrow: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 1.5, color: theme.muted, marginBottom: 5,
  },
  headerIcon: {
    width: 56, height: 56,
    backgroundColor: theme.purple, borderRadius: 14,
    borderWidth: 2.5,
  },
  overview: {
    backgroundColor: theme.yellow,
    padding: 19, borderRadius: 16, marginBottom: 28,
  },
  between: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  whiteIcon: {
    width: 47, height: 47, backgroundColor: theme.white,
  },
  badge: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 10, fontWeight: "900",
    color: theme.black, overflow: "hidden",
  },
  count: {
    fontSize: 46, fontWeight: "900",
    color: theme.black, marginTop: 15,
  },
  overviewTitle: {
    fontSize: 18, fontWeight: "900",
    color: theme.black, marginTop: 2,
  },
  small: {
    fontSize: 12, color: theme.black, marginTop: 7,
  },
  addButton: {
    justifyContent: "space-between", marginBottom: 30,
  },
  section: {
    flexDirection: "row", alignItems: "center",
    gap: 10, marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 21, fontWeight: "900", color: theme.black,
  },
  staffCard: {
    borderWidth: 2, padding: 15, marginBottom: 15,
  },
  staffRow: {
    flexDirection: "row", alignItems: "center", gap: 13,
  },
  avatar: {
    width: 53, height: 53, borderRadius: 12,
    borderWidth: 2, borderColor: theme.black,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: {
    fontSize: 18, fontWeight: "900", color: theme.black,
  },
  staffName: {
    fontSize: 16, fontWeight: "900", color: theme.black,
  },
  emailRow: {
    flexDirection: "row", alignItems: "center",
    gap: 6, marginTop: 6,
  },
  email: {
    fontSize: 12, color: theme.muted, flexShrink: 1,
  },
  divider: {
    height: 2, backgroundColor: theme.black,
    marginVertical: 14,
  },
  role: {
    flexDirection: "row", alignItems: "center",
    gap: 6, backgroundColor: theme.blue,
    borderWidth: 2, borderColor: theme.black,
    borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8,
  },
  roleText: {
    fontSize: 12, fontWeight: "900", color: theme.black,
  },
  remove: {
    flexDirection: "row", alignItems: "center",
    gap: 7, backgroundColor: theme.pink,
    borderWidth: 2, borderColor: theme.black,
    borderRadius: 9, paddingHorizontal: 13, paddingVertical: 9,
  },
  empty: {
    ...c.card, borderWidth: 2, borderStyle: "dashed",
    alignItems: "center", padding: 26,
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 17,
    backgroundColor: theme.purple,
  },
  emptyTitle: {
    fontSize: 19, fontWeight: "900",
    color: theme.black, marginTop: 17,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row", alignItems: "center",
    gap: 8, backgroundColor: theme.green,
    borderWidth: 2, borderColor: theme.black,
    borderRadius: 10, paddingHorizontal: 15,
    paddingVertical: 12, marginTop: 20,
  },
});
