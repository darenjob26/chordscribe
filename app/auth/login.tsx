"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import ThemedInput from "@/components/ui/Input";
import Input from "@/components/ui/Input";
import ThemedButton from "@/components/ui/TButton";
import { useAuth } from "@/providers/auth-provider";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
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
              Enter your credentials to access your account
            </Text>
          </View>

          <View className="mb-6">
            {/* Email Input */}
            <ThemedInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              leftIcon={<Feather name="mail" size={20} color={colors.muted} />}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Password Input */}
            <ThemedInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              leftIcon={<Feather name="lock" size={20} color={colors.muted} />}
              rightIcon={<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={!showPassword ? "eye-off" : "eye"} size={20} color={colors.muted} />
              </TouchableOpacity>}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              className="self-end mb-6"
              onPress={() => router.push("/auth/forgot-password")}
            >
              <Text style={{ color: colors.secondary }}>Forgot password?</Text>
            </TouchableOpacity>

            <ThemedButton variant="default" title="Sign In" onPress={handleLogin} disabled={isLoading} />

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
              <Text className="mx-4" style={{ color: colors.muted }}>OR</Text>
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
            </View>

            <ThemedButton
              variant="outline"
              title="Sign in with Google"
              onPress={() => { }}
              disabled={isLoading}
              leftIcon={<GoogleIcon />}
            />

          </View>

          <View className="flex-row justify-center">
            <Text style={{ color: colors.muted }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/signup")}>
              <Text style={{ color: colors.secondary }}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function GoogleIcon() {
  return (
    <View className="w-6 h-6 rounded-full bg-gray-100 justify-center items-center mr-2">
      <Text className="text-base font-bold">G</Text>
    </View>
  );
}
