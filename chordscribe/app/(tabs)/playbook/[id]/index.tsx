"use client";

import { useTheme } from "@/providers/theme-provider";
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
import { usePlaybook } from "@/providers/PlaybookProvider";
import { Playbook, Song } from "@/types/playbook";

export default function PlaybookSongsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { playbooks, deleteSongFromPlaybook } = usePlaybook();

  const playbook = playbooks.find(p => p._id === id);
  const headerHeight = insets.top + 30;

  const handleAddSong = () => {
    router.push({
      pathname: '/(tabs)/playbook/[id]/add-song',
      params: { id }
    });
  };

  const handleDeleteSong = (songId: string) => {
    Alert.alert(
      "Delete Song",
      "Are you sure you want to delete this song?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSongFromPlaybook(id, songId)
        }
      ]
    );
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 rounded-lg border mb-3"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      onPress={() => router.push(`/playbook/${id}/song/${item.id}` as any)}
    >
      <View
        className="w-10 h-10 rounded-lg justify-center items-center mr-3 bg-gray-500"
      >
        <Feather name="music" size={20} color="white" />
      </View>
      <View className="flex-1">
        <Text
          className="text-lg font-semibold"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-md" style={{ color: colors.muted }}>
          Key: {item.key} • {item.sections.length} {item.sections.length === 1 ? "section" : "sections"}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteSong(item.id)}
        className="p-2"
      >
        <Feather name="trash-2" size={20} color={colors.error} />
      </TouchableOpacity>
      <Feather name="chevron-right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  if (!playbook) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: colors.text }}>Playbook not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4" style={{ paddingTop: headerHeight, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {playbook.name}
          </Text>
        </View>
        <ThemedButton
          title="Add Song"
          onPress={handleAddSong}
        />
      </View>

      {playbook.songs.length === 0 ? (
        <View className="items-center py-8 flex-1 justify-center">
          <Text className="text-base text-muted mb-2">No songs added yet</Text>
          <Text className="text-sm text-muted">Tap the Add Song button to create a new song</Text>
        </View>
      ) : (
        <FlatList
          data={playbook.songs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          className="pb-4"
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  );
}
