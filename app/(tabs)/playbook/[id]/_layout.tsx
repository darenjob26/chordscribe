import { Stack } from "expo-router";

export default function PlaybookSongsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new-section" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}
