"use client";

import { useTheme } from "@/providers/theme-provider";
import ThemedButton from "@/components/ui/TButton";
import ThemedInput from "@/components/ui/Input";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Playbook } from "@/types/playbook";
import { playBookStore$ } from "@/store";
import { observer } from "@legendapp/state/react";
import { useAuth } from "@/providers/auth-provider";

export default observer(function PlaybookScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPlaybookName, setNewPlaybookName] = useState("");
  const { dbUser } = useAuth();

  const playbooks = playBookStore$.playbooks.get();

  const handleAddPlaybook = async () => {
    if (newPlaybookName.trim()) {
      try {
        // Create new playbook
        const newPlaybook: Playbook = {
          _id: Math.random().toString(36).substring(2, 15),
          userId: dbUser?.userId ?? "", // TODO: Get actual user ID
          name: newPlaybookName.trim(),
          songs: [],
          syncStatus: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to store
        playBookStore$.addPlaybook(newPlaybook);

        // Reset form
        setNewPlaybookName("");
        setIsAddDialogOpen(false);
      } catch (error) {
        Alert.alert("Error", "Failed to create playbook");
      }
    } else {
      Alert.alert("Error", "Please enter a playbook name");
    }
  };

  const renderPlaybookItem = ({ item }: { item: Playbook }) => (
    <TouchableOpacity
      key={item._id}
      className="flex-row items-center p-4 rounded-lg border mb-3"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      onPress={() => {
        playBookStore$.selectedPlaybook.set(item._id)
        router.push(`/playbook/${item._id}` as any)
      }}
    >
      <View
        className="w-10 h-10 rounded-lg justify-center items-center mr-3 bg-gray-500"
      >
        <Feather name="book" size={20} color={"white"} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-lg font-semibold"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item._id === "default" && (
            <Feather name="lock" size={14} color={colors.muted} />
          )}
        </View>
        <Text className="text-md" style={{ color: colors.muted }}>
          {item.songs.length} {item.songs.length === 1 ? "song" : "songs"}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  const headerHeight = insets.top + 30;

  return (
    <View className="flex-1 p-4" style={{ paddingTop: headerHeight, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Your Playbooks
        </Text>
        <ThemedButton
          title="Add Playbook"
          onPress={() => setIsAddDialogOpen(true)}
        />
      </View>

      {/* Playbooks List */}
      <FlatList
        data={playbooks}
        renderItem={renderPlaybookItem}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        className="pb-4"
        showsVerticalScrollIndicator={false}
      />

      {/* Add Playbook Dialog */}
      {isAddDialogOpen && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center p-4">
          <View
            className="w-full rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>
              Create New Playbook
            </Text>
            <Text className="text-base mb-6" style={{ color: colors.muted }}>
              Enter a name for your new playbook.
            </Text>

            <ThemedInput
              label="Playbook Name"
              placeholder="My New Playbook"
              value={newPlaybookName}
              onChangeText={setNewPlaybookName}
              autoFocus
            />

            <View className="flex-row justify-end gap-3">
              <ThemedButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setIsAddDialogOpen(false);
                  setNewPlaybookName("");
                }}
              />

              <ThemedButton
                title="Create"
                onPress={handleAddPlaybook}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
})
