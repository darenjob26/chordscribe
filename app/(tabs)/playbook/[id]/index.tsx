"use client";

import { useTheme } from "@/components/theme-provider";
import ThemedInput from "@/components/ui/Input";
import ThemedButton from "@/components/ui/TButton";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlaybook } from "@/providers/playbook-provider";
import { Playbook } from "@/types/playbook";

export default function PlaybookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { getPlaybook, updatePlaybook, deletePlaybook, isLoading } = usePlaybook();

  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [newPlaybookName, setNewPlaybookName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPlaybook();
  }, [id]);

  const loadPlaybook = async () => {
    try {
      const loadedPlaybook = await getPlaybook(id);
      if (loadedPlaybook) {
        setPlaybook(loadedPlaybook);
        setNewPlaybookName(loadedPlaybook.name);
      }
    } catch (error) {
      console.error("Failed to load playbook:", error);
    }
  };

  const handleRenamePlaybook = async () => {
    if (playbook && newPlaybookName.trim() && playbook.id !== "default") {
      try {
        const updatedPlaybook = await updatePlaybook(playbook.id, { name: newPlaybookName });
        setPlaybook(updatedPlaybook);
        setIsRenameDialogOpen(false);
      } catch (error) {
        Alert.alert("Error", "Failed to rename playbook");
      }
    }
  };

  const handleDeletePlaybook = async () => {
    if (playbook && playbook.id !== "default") {
      try {
        await deletePlaybook(playbook.id);
        router.replace("/playbook/index");
      } catch (error) {
        Alert.alert("Error", "Failed to delete playbook");
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const filteredSongs =
    playbook?.songs.filter((song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: colors.text }}>Loading playbook...</Text>
      </View>
    );
  }

  if (!playbook) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-muted">Playbook not found</Text>
      </View>
    );
  }

  const headerHeight = insets.top + 30;

  return (
    <View className="flex-1 p-4" style={{ paddingTop: headerHeight }}>
      <View className="mb-8">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            className="text-2xl font-bold"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {playbook.name}
          </Text>

          {playbook.id !== "default" && <TouchableOpacity
            className="p-2"
            onPress={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
          >
            <Feather name="more-horizontal" size={24} color={colors.text} />
          </TouchableOpacity> }
        </View>

        {isOptionsMenuOpen && playbook.id !== "default" && (
          <View
            className="gap-2 p-2 absolute right-10 top-10 w-40 rounded-lg border border-gray-300 bg-white shadow-md z-10"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <ThemedButton
              size="sm"
              variant="outline"
              title="Rename"
              onPress={() => {
                setIsRenameDialogOpen(true);
                setIsOptionsMenuOpen(false);
              }}
              leftIcon={<Feather name="edit-2" size={16} color={colors.text} />}
            />
            <ThemedButton
              size="sm"
              variant="destructive"
              title="Delete"
              onPress={() => {
                setIsDeleteDialogOpen(true);  
                setIsOptionsMenuOpen(false);
              }}
              leftIcon={<Feather name="trash-2" size={16} color={colors.primaryLight} />}
            />
          </View>
        )}
      </View>

      <View className="mb-8">
        <View className="flex-row items-center gap-4 mb-6">
          <View
            className="flex-row items-center h-10 rounded-lg border border-gray-300 bg-gree h-[50px] flex-1"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Feather
              name="search"
              size={20}
              color={colors.muted}
              className="mx-2"
            />
            <TextInput
              className="flex-1"
              style={{ color: colors.text }}
              placeholder="Search songs..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ThemedButton
            title="Add Song"
            onPress={() => router.push(`/playbook/${id}/add-song` as any)}
            leftIcon={<Feather name="plus" size={18} color="white" />}
          />
        </View>

        {filteredSongs.length > 0 ? (
          <FlatList
            data={filteredSongs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center p-4 rounded-lg border border-gray-300 bg-white mb-2"
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                onPress={() =>
                  router.push(`/playbook/${id}/song/${item.id}` as any)
                }
              >
                <Feather
                  name="music"
                  size={20}
                  color={colors.primary}
                  className="mr-2"
                />
                <View className="flex-1">
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: colors.text }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    Key: {item.key}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-muted">
              {searchQuery
                ? "No songs match your search"
                : "No songs in this playbook yet"}
            </Text>
          </View>
        )}
      </View>

      {/* Rename Dialog */}
      {isRenameDialogOpen && playbook.id !== "default" && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View
            className="w-[90%] rounded-lg p-6"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
              Rename Playbook
            </Text>
            <Text className="text-sm mb-4" style={{ color: colors.muted }}>
              Change the name of your playbook.
            </Text>

            <Text className="text-sm mb-2" style={{ color: colors.text }}>
              Playbook Name
            </Text>
            <TextInput
              className="h-12 rounded-lg border border-gray-300 bg-white px-4 mb-4"
              style={{ color: colors.text, borderColor: colors.border }}
              placeholder="My Playbook"
              placeholderTextColor={colors.muted}
              value={newPlaybookName}
              onChangeText={setNewPlaybookName}
              autoFocus
            />

            <View className="flex-row justify-end gap-3">
              <ThemedButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setIsRenameDialogOpen(false);
                  setNewPlaybookName(playbook.name);
                }}
              />
              <ThemedButton
                title="Save"
                onPress={handleRenamePlaybook}
              />
            </View>
          </View>
        </View>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && playbook.id !== "default" && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View
            className="w-[90%] rounded-lg p-6"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
              Delete Playbook
            </Text>
            <Text className="text-sm mb-4" style={{ color: colors.muted }}>
              Are you sure you want to delete this playbook? This action
              cannot be undone.
            </Text>

            <View
              className="p-4 rounded-lg mb-4"
              style={{ backgroundColor: colors.error + '20' }}
            >
              <Text className="text-sm" style={{ color: colors.error }}>
                Warning: Deleting "{playbook.name}" will permanently remove
                all songs within this playbook.
              </Text>
            </View>

            <View className="flex-row justify-end gap-3">
              <ThemedButton
                title="Cancel"
                variant="outline"
                onPress={() => setIsDeleteDialogOpen(false)}
              />
              <ThemedButton   
                title="Delete"
                variant="destructive"
                onPress={handleDeletePlaybook}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
