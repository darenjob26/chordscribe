"use client";

import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/theme-provider";
import ThemedButton from "@/components/ui/TButton";
import { useAuth } from "@/providers/auth-provider";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)/playbook");
    } catch (error: any) {
      let errorMessage = "Failed to sign in. Please try again.";
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address. Please check your email.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email. Please sign up first.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      }

      Alert.alert(
        "Sign In Failed",
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: "center" }}>
          <View className="items-center mb-8">
            <View
              className="w-16 h-16 rounded-full justify-center items-center mb-4"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Feather name="music" size={32} color={colors.primary} />
            </View>
            <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
              Welcome to ChordScribe
            </Text>
            <Text className="text-base text-center" style={{ color: colors.muted }}>
              Sign in to continue
            </Text>
          </View>

          <View className="space-y-4">
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
                Email
              </Text>
              <TextInput
                className="h-[50px] border rounded-lg px-4 text-base"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
                Password
              </Text>
              <TextInput
                className="h-[50px] border rounded-lg px-4 text-base"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <ThemedButton
              title="Sign In"
              onPress={handleLogin}
              disabled={isLoading}
            />

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
              <Text className="mx-4" style={{ color: colors.muted }}>OR</Text>
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
            </View>

            <ThemedButton
              variant="outline"
              title="Sign in with Google"
              onPress={() => {}}
              disabled={true}
              leftIcon={<View className="w-6 h-6 rounded-full bg-gray-100 justify-center items-center mr-2">
                <Text className="text-base font-bold">G</Text>
              </View>}
            />

            <View className="flex-row justify-center mt-4">
              <Text className="text-sm" style={{ color: colors.muted }}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
