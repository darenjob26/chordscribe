"use client";

import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import ThemedInput from "@/components/ui/Input";
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
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const { colors } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update password. Please try again.");
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
        <View className="flex-row items-center p-4 border-b" style={{ borderColor: colors.border }}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold ml-2" style={{ color: colors.text }}>
            Change Password
          </Text>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="mb-6">
            <ThemedInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter your current password"
              leftIcon={<Feather name="lock" size={20} color={colors.muted} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Feather
                    name={showCurrentPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              }
              secureTextEntry={!showCurrentPassword}
            />

            <ThemedInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter your new password"
              leftIcon={<Feather name="lock" size={20} color={colors.muted} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Feather
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              }
              secureTextEntry={!showNewPassword}
            />

            <ThemedInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your new password"
              leftIcon={<Feather name="lock" size={20} color={colors.muted} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              }
              secureTextEntry={!showConfirmPassword}
            />
          </View>

          <Button
            onPress={handleSave}
            isLoading={isLoading}
            className="mb-6"
          >
            <Text className="text-white text-base font-semibold">Update Password</Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 