import { Stack } from "expo-router";

export default function PlaybookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false, presentation: "card" }} />
    </Stack>
  );
}
