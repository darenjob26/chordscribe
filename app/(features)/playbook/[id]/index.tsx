"use client";

import { MainLayout } from "@/components/layouts/main-layout";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
      <MainLayout>
        <View style={styles.container}>
          <Text>Playbook not found</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {playbook.name}
            </Text>

            {!playbook.isDefault && (
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
              >
                <Feather name="more-horizontal" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {isOptionsMenuOpen && !playbook.isDefault && (
            <View
              style={[
                styles.optionsMenu,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  setIsRenameDialogOpen(true);
                  setIsOptionsMenuOpen(false);
                }}
              >
                <Feather name="edit-2" size={16} color={colors.text} />
                <Text style={[styles.optionText, { color: colors.text }]}>
                  Rename Playbook
                </Text>
              </TouchableOpacity>
              <View
                style={[
                  styles.optionDivider,
                  { backgroundColor: colors.border },
                ]}
              />
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  setIsDeleteDialogOpen(true);
                  setIsOptionsMenuOpen(false);
                }}
              >
                <Feather name="trash-2" size={16} color={colors.error} />
                <Text style={[styles.optionText, { color: colors.error }]}>
                  Delete Playbook
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather
              name="search"
              size={20}
              color={colors.muted}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search songs..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Button
            onPress={() => router.push(`/playbook/${id}/add-song` as any)}
            leftIcon={<Feather name="plus" size={18} color="white" />}
          >
            <Text style={styles.buttonText}>Add Song</Text>
          </Button>
        </View>

        {filteredSongs.length > 0 ? (
          <FlatList
            data={filteredSongs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.songCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() =>
                  router.push(`/playbook/${id}/song/${item.id}` as any)
                }
              >
                <Feather
                  name="music"
                  size={20}
                  color={colors.primary}
                  style={styles.songIcon}
                />
                <View style={styles.songInfo}>
                  <Text
                    style={[styles.songTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.songKey, { color: colors.muted }]}>
                    Key: {item.key}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.muted }}>
              {searchQuery
                ? "No songs match your search"
                : "No songs in this playbook yet"}
            </Text>
          </View>
        )}

        {/* Rename Dialog */}
        {isRenameDialogOpen && (
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Rename Playbook
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                Change the name of your playbook.
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Playbook Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    color: colors.text,
                  },
                ]}
                value={newPlaybookName}
                onChangeText={setNewPlaybookName}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={() => {
                    setIsRenameDialogOpen(false);
                    setNewPlaybookName(playbook.name);
                  }}
                  style={styles.modalButton}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Button>
                <Button
                  onPress={handleRenamePlaybook}
                  style={styles.modalButton}
                >
                  <Text style={styles.buttonText}>Save Changes</Text>
                </Button>
              </View>
            </View>
          </View>
        )}

        {/* Delete Confirmation Dialog */}
        {isDeleteDialogOpen && (
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Delete Playbook
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                Are you sure you want to delete this playbook? This action
                cannot be undone.
              </Text>

              <View
                style={[
                  styles.warningBox,
                  { backgroundColor: colors.error + "20" },
                ]}
              >
                <Text style={[styles.warningText, { color: colors.error }]}>
                  Warning: Deleting "{playbook.name}" will permanently remove
                  all songs within this playbook.
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={() => setIsDeleteDialogOpen(false)}
                  style={styles.modalButton}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Button>
                <Button
                  variant="destructive"
                  onPress={handleDeletePlaybook}
                  style={styles.modalButton}
                >
                  <Text style={styles.buttonText}>Delete Playbook</Text>
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  optionsButton: {
    padding: 8,
  },
  optionsMenu: {
    position: "absolute",
    right: 0,
    top: 40,
    width: 200,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 14,
  },
  optionDivider: {
    height: 1,
    marginHorizontal: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 16,
  },
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  songIcon: {
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  songKey: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 100,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  warningBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
});
