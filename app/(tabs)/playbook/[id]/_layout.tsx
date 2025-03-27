import { Stack } from "expo-router";
import { SongProvider } from "@/contexts/SongProvider";

export default function PlaybookLayout() {
  return (
    <SongProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="add-song"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="new-or-edit-section"
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="song/[songId]"
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </SongProvider>
  );
}
