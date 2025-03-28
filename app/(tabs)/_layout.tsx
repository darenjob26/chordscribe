import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PlaybookProvider } from "@/providers/playbook-provider";
import { useTheme } from "@/providers/theme-provider";

export default function FeaturesLayout() {
  const { colors } = useTheme();

  return (
    <PlaybookProvider>
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
          title: 'Seesion',
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
        <Tabs.Screen
          name="mongodb-test"
          options={{
            title: 'MongoDB Test',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="server-outline" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </PlaybookProvider>
  );
}