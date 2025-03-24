"use client";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import {
  ScrollView,
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
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          ChordScribe
        </Text>
      </View>

      <ScrollView className="flex-1">
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            className="flex-row items-center p-4 rounded-lg mx-2 my-1"
            style={[
              pathname === item.path && {
                backgroundColor: colors.primaryLight,
              },
            ]}
            onPress={() => handleNavigation(item.path)}
          >
            <Feather
              name={item.icon as any}
              size={18}
              color={pathname === item.path ? colors.primary : colors.text}
            />
            <Text
              className="ml-3 text-base"
              style={{
                color: pathname === item.path ? colors.primary : colors.text,
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="p-4 border-t border-gray-200">
        {user && (
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-black justify-center items-center">
              <Text className="text-white text-base font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View className="ml-3 flex-1">
              <Text
                className="font-semibold text-base"
                style={{ color: colors.text }}
                numberOfLines={1}
              >
                {user.name || "User"}
              </Text>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {user.email || ""}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          className="flex-row items-center p-3 rounded-lg border border-gray-200"
          onPress={signOut}
        >
          <Feather name="log-out" size={18} color={colors.text} />
          <Text className="ml-2 text-sm" style={{ color: colors.text }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
