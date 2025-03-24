import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function FeaturesLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#3498b" }}>
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
    </Tabs>
  );
}