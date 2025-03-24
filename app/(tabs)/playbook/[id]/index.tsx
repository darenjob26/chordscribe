"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import ThemedInput from "@/components/ui/Input";
import ThemedButton from "@/components/ui/TButton";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock data for playbooks and songs
interface Song {
  id: string;
  title: string;
  key: string;
  content: string;
}

interface Playbook {
  id: string;
  name: string;
  isDefault?: boolean;
  songs: Song[];
}

// Mock data for playbooks and songs
const mockPlaybooks: Record<string, Playbook> = {
  default: {
    id: "default",
    name: "Your Songs",
    isDefault: true,
    songs: [
      {
        id: "1",
        title: "Autumn Leaves",
        key: "Em",
        content: "Am7 | D7 | Gmaj7 | Cmaj7 | F#m7b5 | B7 | Em | Em",
      },
      {
        id: "2",
        title: "Blue Bossa",
        key: "Cm",
        content: "Cm7 | Cm7 | Fm7 | Fm7 | Dm7b5 | G7 | Cm7 | Cm7",
      },
      {
        id: "3",
        title: "All of Me",
        key: "C",
        content: "C | C | E7 | E7 | A7 | A7 | Dm | Dm",
      },
    ],
  },
  jazz: {
    id: "jazz",
    name: "Jazz Standards",
    songs: [
      {
        id: "4",
        title: "Take Five",
        key: "Ebm",
        content: "Ebm | Bbm7 | Ebm | Bbm7 | Ebm | Bbm7 | Ebm | Abm7 Db7",
      },
      {
        id: "5",
        title: "So What",
        key: "D Dorian",
        content: "Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7",
      },
    ],
  },
  practice: {
    id: "practice",
    name: "Practice Routines",
    songs: [
      {
        id: "6",
        title: "Major Scales",
        key: "C",
        content: "C | D | E | F | G | A | B | C",
      },
      {
        id: "7",
        title: "Minor Scales",
        key: "Am",
        content: "Am | Bm | Cm | Dm | Em | Fm | Gm | Am",
      },
    ],
  },
  gigs: {
    id: "gigs",
    name: "Upcoming Gigs",
    songs: [
      {
        id: "8",
        title: "Wedding Set",
        key: "G",
        content: "G | D | Em | C | G | D | C | G",
      },
      {
        id: "9",
        title: "Jazz Club Set",
        key: "C",
        content: "Dm7 | G7 | Cmaj7 | Cmaj7 | Fm7 | Bb7 | Ebmaj7 | Ebmaj7",
      },
    ],
  },
  pop: {
    id: "pop",
    name: "Pop Hits",
    songs: [
      {
        id: "10",
        title: "Wonderwall",
        key: "F#m",
        content: "Em7 | G | D | A7sus4 | Em7 | G | D | A7sus4",
      },
      {
        id: "11",
        title: "Perfect",
        key: "G",
        content: "G | Em | C | D | G | Em | C | D | Em | C | G | D",
      },
      {
        id: "12",
        title: "Someone Like You",
        key: "A",
        content:
          "A | E/G# | F#m | D | A | E/G# | F#m | D | E | F#m | D | A | E",
      },
    ],
  },
};

export default function PlaybookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [newPlaybookName, setNewPlaybookName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // In a real app, you would fetch the playbook data from an API
    const foundPlaybook = mockPlaybooks[id as string];
    if (foundPlaybook) {
      setPlaybook(foundPlaybook);
      setNewPlaybookName(foundPlaybook.name);
    }
  }, [id]);

  const handleRenamePlaybook = () => {
    if (playbook && newPlaybookName.trim()) {
      // In a real app, you would update the playbook name via an API
      setPlaybook({
        ...playbook,
        name: newPlaybookName,
      });
      setIsRenameDialogOpen(false);
    }
  };

  const handleDeletePlaybook = () => {
    // In a real app, you would delete the playbook via an API
    router.replace("/playbook/index");
    setIsDeleteDialogOpen(false);
  };

  const filteredSongs =
    playbook?.songs.filter((song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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

          {!playbook.isDefault && (
            <TouchableOpacity
              className="p-2"
              onPress={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
            >
              <Feather name="more-horizontal" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {isOptionsMenuOpen && !playbook.isDefault && (
          <View
            className="absolute right-0 top-10 w-40 rounded-lg border border-gray-300 bg-white shadow-md"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <TouchableOpacity
              className="flex-row items-center p-2"
              onPress={() => {
                setIsRenameDialogOpen(true);
                setIsOptionsMenuOpen(false);
              }}
            >
              <Feather name="edit-2" size={16} color={colors.text} />
              <Text className="ml-2" style={{ color: colors.text }}>
                Rename Playbook
              </Text>
            </TouchableOpacity>
            <View
              className="h-px bg-gray-300"
            />
            <TouchableOpacity
              className="flex-row items-center p-2"
              onPress={() => {
                setIsDeleteDialogOpen(true);
                setIsOptionsMenuOpen(false);
              }}
            >
              <Feather name="trash-2" size={16} color={colors.error} />
              <Text className="ml-2" style={{ color: colors.error }}>
                Delete Playbook
              </Text>
            </TouchableOpacity>
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

        {/* Rename Dialog */}
        {isRenameDialogOpen && (
          <View className="absolute inset-0 justify-center items-center">
            <View
              className="w-full rounded-lg p-4"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                Rename Playbook
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Change the name of your playbook.
              </Text>

              <Text className="text-sm" style={{ color: colors.text }}>
                Playbook Name
              </Text>
              <TextInput
                className="h-10 rounded-lg border border-gray-300 bg-white"
                style={{ color: colors.text }}
                placeholder="My Playbook"
                placeholderTextColor={colors.muted}
                value={newPlaybookName}
                onChangeText={setNewPlaybookName}
                autoFocus
              />


              <View className="flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onPress={() => {
                    setIsRenameDialogOpen(false);
                    setNewPlaybookName(playbook.name);
                  }}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Button>
                <Button
                  onPress={handleRenamePlaybook}
                >
                  <Text style={{ color: colors.text }}>Save Changes</Text>
                </Button>
              </View>
            </View>
          </View>
        )}

        {/* Delete Confirmation Dialog */}
        {isDeleteDialogOpen && (
          <View className="absolute inset-0 justify-center items-center">
            <View
              className="w-full rounded-lg p-4"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                Delete Playbook
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Are you sure you want to delete this playbook? This action
                cannot be undone.
              </Text>

              <View
                className="p-4 rounded-lg bg-red-50"
              >
                <Text className="text-sm" style={{ color: colors.error }}>
                  Warning: Deleting "{playbook.name}" will permanently remove
                  all songs within this playbook.
                </Text>
              </View>

              <View className="flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onPress={() => setIsDeleteDialogOpen(false)}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Button>
                <Button
                  variant="destructive"
                  onPress={handleDeletePlaybook}
                >
                  <Text style={{ color: colors.text }}>Delete Playbook</Text>
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
