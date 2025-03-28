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

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({ name, email });
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
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
            Edit Profile
          </Text>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="items-center mb-8">
            <View
              className="w-24 h-24 rounded-full bg-black justify-center items-center mb-4"
            >
              <Text className="text-white text-3xl font-bold">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center px-4 py-2 rounded-full border"
              style={{ borderColor: colors.border }}
            >
              <Feather name="camera" size={20} color={colors.text} />
              <Text className="ml-2" style={{ color: colors.text }}>
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <ThemedInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              leftIcon={<Feather name="user" size={20} color={colors.muted} />}
            />

            <ThemedInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              leftIcon={<Feather name="mail" size={20} color={colors.muted} />}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Button
            onPress={handleSave}
            isLoading={isLoading}
            className="mb-6"
          >
            <Text className="text-white text-base font-semibold">Save Changes</Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 