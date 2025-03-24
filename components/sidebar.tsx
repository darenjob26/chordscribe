"use client";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { colors } = useTheme();

  const handleNavigation = (path: string) => {
    router.push(path as any);
    if (onClose) {
      onClose();
    }
  };

  const navItems = [
    { icon: "book", label: "Playbooks", path: "/playbook" },
    { icon: "music", label: "Sessions", path: "/session" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>ChordScribe</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={[
              styles.navItem,
              pathname === item.path && {
                backgroundColor: colors.primaryLight,
              },
            ]}
            onPress={() => handleNavigation(item.path)}
          >
            <Feather
              name={item.icon as any}
              size={20}
              color={pathname === item.path ? colors.primary : colors.text}
            />
            <Text
              style={[
                styles.navLabel,
                {
                  color: pathname === item.path ? colors.primary : colors.text,
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {user && (
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View style={styles.userTextContainer}>
              <Text
                style={[styles.userName, { color: colors.text }]}
                numberOfLines={1}
              >
                {user.name || "User"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email || ""}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Feather name="log-out" size={18} color={colors.text} />
          <Text style={[styles.logoutText, { color: colors.text }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  navLabel: {
    marginLeft: 12,
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
  },
});
