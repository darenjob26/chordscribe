"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

// Types
interface Song {
  id: string
  title: string
  key: string
}

interface Session {
  id: string
  name: string
  date: string
  songs: Song[]
}

// Mock data for sessions
const mockSessions: Record<string, Session> = {
  "1": {
    id: "1",
    name: "Jazz Trio Rehearsal",
    date: "2023-10-15",
    songs: [
      { id: "1", title: "Autumn Leaves", key: "Em" },
      { id: "2", title: "Blue Bossa", key: "Cm" },
      { id: "3", title: "All of Me", key: "C" },
      { id: "4", title: "Take Five", key: "Ebm" },
      { id: "5", title: "So What", key: "D Dorian" },
      { id: "6", title: "Summertime", key: "Am" },
      { id: "7", title: "Fly Me to the Moon", key: "Am" },
      { id: "8", title: "My Funny Valentine", key: "Cm" },
    ],
  },
  "2": {
    id: "2",
    name: "Solo Practice",
    date: "2023-10-12",
    songs: [
      { id: "6", title: "Major Scales", key: "C" },
      { id: "7", title: "Minor Scales", key: "Am" },
      { id: "1", title: "Autumn Leaves", key: "Em" },
      { id: "2", title: "Blue Bossa", key: "Cm" },
      { id: "3", title: "All of Me", key: "C" },
    ],
  },
  "3": {
    id: "3",
    name: "Band Rehearsal",
    date: "2023-10-08",
    songs: [
      { id: "10", title: "Wonderwall", key: "F#m" },
      { id: "11", title: "Perfect", key: "G" },
      { id: "12", title: "Someone Like You", key: "A" },
      { id: "13", title: "Shape of You", key: "C#m" },
      { id: "14", title: "Thinking Out Loud", key: "D" },
      { id: "15", title: "All of Me (John Legend)", key: "F" },
      { id: "16", title: "Stay With Me", key: "C" },
      { id: "17", title: "Shallow", key: "G" },
      { id: "18", title: "Just the Way You Are", key: "F" },
      { id: "19", title: "Photograph", key: "Eb" },
      { id: "20", title: "When I Was Your Man", key: "Bb" },
      { id: "21", title: "Let Her Go", key: "G" },
    ],
  },
}

export default function SessionDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()

  const [session, setSession] = useState<Session | null>(null)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // In a real app, you would fetch the session data from an API
    const foundSession = mockSessions[id as string]
    if (foundSession) {
      setSession(foundSession)
      setNewSessionName(foundSession.name)
    }
  }, [id])

  const handleRenameSession = () => {
    if (session && newSessionName.trim()) {
      // In a real app, you would update the session name via an API
      setSession({
        ...session,
        name: newSessionName,
      })
      setIsRenameDialogOpen(false)
    }
  }

  const handleDeleteSession = () => {
    // In a real app, you would delete the session via an API
    router.replace("/session")
    setIsDeleteDialogOpen(false)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const filteredSongs =
    session?.songs.filter((song) => song.title.toLowerCase().includes(searchQuery.toLowerCase())) || []

  if (!session) {
    return (
      <MainLayout>
        <View style={styles.container}>
          <Text>Session not found</Text>
        </View>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {session.name}
            </Text>
            <Text style={[styles.date, { color: colors.muted }]}>{formatDate(session.date)}</Text>
          </View>
          <TouchableOpacity style={styles.optionsButton} onPress={() => setIsRenameDialogOpen(true)}>
            <Feather name="edit-2" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={20} color={colors.muted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search songs..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Button
            onPress={() => Alert.alert("Add Song", "This feature is coming soon!")}
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
                style={[styles.songCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => Alert.alert("View Song", `Viewing ${item.title} is coming soon!`)}
              >
                <Feather name="music" size={20} color={colors.primary} style={styles.songIcon} />
                <View style={styles.songInfo}>
                  <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.songKey, { color: colors.muted }]}>Key: {item.key}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.muted }}>
              {searchQuery ? "No songs match your search" : "No songs in this session yet"}
            </Text>
          </View>
        )}

        <Button
          variant="destructive"
          onPress={() => setIsDeleteDialogOpen(true)}
          style={styles.deleteButton}
          leftIcon={<Feather name="trash-2" size={18} color="white" />}
        >
          <Text style={styles.buttonText}>Delete Session</Text>
        </Button>

        {/* Rename Dialog */}
        {isRenameDialogOpen && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Rename Session</Text>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>Change the name of your session.</Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Session Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    color: colors.text,
                  },
                ]}
                value={newSessionName}
                onChangeText={setNewSessionName}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={() => {
                    setIsRenameDialogOpen(false)
                    setNewSessionName(session.name)
                  }}
                  style={styles.modalButton}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Button>
                <Button onPress={handleRenameSession} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </Button>
              </View>
            </View>
          </View>
        )}

        {/* Delete Confirmation Dialog */}
        {isDeleteDialogOpen && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Session</Text>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                Are you sure you want to delete this session? This action cannot be undone.
              </Text>

              <View style={[styles.warningBox, { backgroundColor: colors.error + "20" }]}>
                <Text style={[styles.warningText, { color: colors.error }]}>
                  Warning: Deleting "{session.name}" will remove it from your sessions list.
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <Button variant="outline" onPress={() => setIsDeleteDialogOpen(false)} style={styles.modalButton}>
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Button>
                <Button variant="destructive" onPress={handleDeleteSession} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Delete Session</Text>
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    </MainLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  date: {
    fontSize: 16,
  },
  optionsButton: {
    padding: 8,
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
  deleteButton: {
    marginTop: 16,
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
})

