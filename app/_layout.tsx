import { ThemeProvider } from "@/providers/theme-provider";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { AuthProvider } from "@/providers/auth-provider";
import { MongoDBProvider } from "@/providers/mongodb-provider";
import "../global.css";

import { SafeAreaProvider } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <MongoDBProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{ headerShown: false, headerTransparent: true }}
            >
              <Stack.Screen name="index" options={{ headerShown: false, }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaProvider>
        </MongoDBProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

