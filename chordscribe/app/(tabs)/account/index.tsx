"use client";

import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { isNetworkAvailable, setForceOffline } from "@/lib/network";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  const { colors } = useTheme();
  return (
    <View className="mb-8">
      <Text
        className="text-sm font-medium mb-2 px-4"
        style={{ color: colors.muted }}
      >
        {title}
      </Text>
      <View
        className="rounded-lg border"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        {children}
      </View>
    </View>
  );
}

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  isDestructive?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingsItem({
  icon,
  label,
  value,
  isDestructive,
  showChevron = true,
  onPress,
  rightElement,
}: SettingsItemProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 border-b last:border-b-0"
      style={{ borderColor: colors.border }}
      onPress={onPress}
      disabled={!onPress}
    >
      <Feather
        name={icon}
        size={20}
        color={isDestructive ? colors.error : colors.text}
        className="mr-3"
      />
      <View className="flex-1">
        <Text
          className="text-base"
          style={{ color: isDestructive ? colors.error : colors.text }}
        >
          {label}
        </Text>
      </View>
      {value && (
        <Text className="ml-2" style={{ color: colors.muted }}>
          {value}
        </Text>
      )}
      {rightElement}
      {showChevron && onPress && (
        <Feather
          name="chevron-right"
          size={20}
          color={colors.muted}
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const { signOut, user, dbUser } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [showKey, setShowKey] = useState(true);
  const [metronomeSound, setMetronomeSound] = useState(true);
  const [isOffline, setIsOffline] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: signOut,
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            // Implement account deletion
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleOfflineMode = async () => {
    const newOfflineState = !isOffline;
    setIsOffline(newOfflineState);
    setForceOffline(newOfflineState);
    // Force the network check to return offline
    const isAvailable = await isNetworkAvailable();
    Alert.alert(
      "Offline Mode",
      `Network is ${isAvailable ? 'available' : 'unavailable'}. App will ${newOfflineState ? 'simulate' : 'use normal'} network behavior.`
    );
  };

  return (
    <ScrollView
      className="flex-1"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <View className="p-4">
        <Text className="text-2xl font-bold mb-8" style={{ color: colors.text }}>
          Settings
        </Text>

        <SettingsSection title="Profile">
          <SettingsItem
            icon="user"
            label="Name"
            value={dbUser?.name || user?.displayName || "Not set"}
            onPress={() => Stack.push("/account/edit-profile")}
          />
          <SettingsItem
            icon="mail"
            label="Email"
            value={user?.email || "Not set"}
            onPress={() => Stack.push("/account/edit-profile")}
          />
          <SettingsItem
            icon="lock"
            label="Change Password"
            onPress={() => Stack.push("/account/change-password")}
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsItem
            icon="sun"
            label="Dark Mode"
            showChevron={false}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
              />
            }
          />
          <SettingsItem
            icon="music"
            label="Show Key Signatures"
            showChevron={false}
            rightElement={
              <Switch
                value={showKey}
                onValueChange={setShowKey}
              />
            }
          />
          <SettingsItem
            icon="volume-2"
            label="Metronome Sound"
            showChevron={false}
            rightElement={
              <Switch
                value={metronomeSound}
                onValueChange={setMetronomeSound}
              />
            }
          />
          <SettingsItem
            icon="wifi-off"
            label="Offline Mode"
            showChevron={false}
            rightElement={
              <Switch
                value={isOffline}
                onValueChange={toggleOfflineMode}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <SettingsItem
            icon="download"
            label="Export Songs"
            onPress={() => {}}
          />
          <SettingsItem
            icon="upload"
            label="Import Songs"
            onPress={() => {}}
          />
          <SettingsItem
            icon="refresh-cw"
            label="Sync Data"
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="Help & Feedback">
          <SettingsItem
            icon="help-circle"
            label="Help Center"
            onPress={() => {}}
          />
          <SettingsItem
            icon="message-square"
            label="Send Feedback"
            onPress={() => {}}
          />
          <SettingsItem
            icon="info"
            label="About"
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <SettingsItem
            icon="log-out"
            label="Sign Out"
            isDestructive
            onPress={handleSignOut}
          />
          <SettingsItem
            icon="trash-2"
            label="Delete Account"
            isDestructive
            onPress={handleDeleteAccount}
          />
        </SettingsSection>

        <Text
          className="text-center text-sm mt-4 mb-8"
          style={{ color: colors.muted }}
        >
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
