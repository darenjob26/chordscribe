"use client";

import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/theme-provider";
import ThemedButton from "@/components/ui/TButton";
import { useAuth } from "@/providers/auth-provider";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      router.replace("/(tabs)/playbook");
    } catch (error: any) {
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address. Please check your email.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Email/password accounts are not enabled. Please contact support.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      }

      Alert.alert(
        "Sign Up Failed",
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
              Create ChordScribe Account
            </Text>
            <Text className="text-base text-center" style={{ color: colors.muted }}>
              Sign up to get started
            </Text>
          </View>

          <View className="space-y-4">
            <View>
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

            <View>
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

            <View>
              <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
                Confirm Password
              </Text>
              <TextInput
                className="h-[50px] border rounded-lg px-4 text-base"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
                placeholder="Confirm your password"
                placeholderTextColor={colors.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <ThemedButton
              title="Sign Up"
              onPress={handleSignUp}
              disabled={isLoading}
            />

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
              <Text className="mx-4" style={{ color: colors.muted }}>OR</Text>
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
            </View>

            <ThemedButton
              variant="outline"
              title="Sign up with Google"
              onPress={() => {}}
              disabled={true}
              leftIcon={<View className="w-6 h-6 rounded-full bg-gray-100 justify-center items-center mr-2">
                <Text className="text-base font-bold">G</Text>
              </View>}
            />

            <View className="flex-row justify-center mt-4">
              <Text className="text-sm" style={{ color: colors.muted }}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
