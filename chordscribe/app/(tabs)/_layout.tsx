import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/theme-provider";
import { useEffect } from "react";
import { userIdStore$ } from "@/store";
import { useAuth } from "@/providers/auth-provider";
import { observer } from "@legendapp/state/react";

export default observer(function FeaturesLayout() {
  const { colors } = useTheme();
  const { dbUser } = useAuth();

  useEffect(() => {
    userIdStore$.userId.set(dbUser?.userId ?? '');
  }, [dbUser]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingTop: 10,
        }
      }}
    >
      <Tabs.Screen name="playbook" options={{
        title: 'Playbook',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="book-outline" color={color} size={size} />
        ),
      }} />
      <Tabs.Screen name="session" options={{
        title: 'Session',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="musical-notes-outline" color={color} size={size} />
        ),
      }} />
      <Tabs.Screen name="account" options={{
        title: 'Account',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person-outline" color={color} size={size} />
        ),
      }}
      />
    </Tabs>
  );
})