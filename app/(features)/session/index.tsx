"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from "react-native"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

// Mock data for sessions
interface Session {
  id: string
  name: string
  date: string
  songCount: number
}

const initialSessions: Session[] = [
  {
    id: "1",
    name: "Jazz Trio Rehearsal",
    date: "2023-10-15",
    songCount: 8,
  },
  {
    id: "2",
    name: "Solo Practice",
    date: "2023-10-12",
    songCount: 5,
  },
  {
    id: "3",
    name: "Band Rehearsal",
    date: "2023-10-08",
    songCount: 12,
  },
]

export default function SessionScreen() {
  const router = useRouter()
  const { colors } = useTheme()

  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")

  const handleAddSession = () => {
    if (newSessionName.trim()) {
      const today = new Date().toISOString().split("T")[0]
      const newSession: Session = {
        id: `session-${Date.now()}`,
        name: newSessionName,
        date: today,
        songCount: 0,
      }
      setSessions([newSession, ...sessions])
      setNewSessionName("")
      setIsAddDialogOpen(false)
    } else {
      Alert.alert("Error", "Please enter a session name")
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const renderSessionItem = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/session/${item.id}`)}
    >
      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.sessionDate, { color: colors.muted }]}>{formatDate(item.date)}</Text>
        <Text style={[styles.sessionSongs, { color: colors.muted }]}>
          {item.songCount} {item.songCount === 1 ? "song" : "songs"}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.muted} />
    </TouchableOpacity>
  )

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Practice Sessions</Text>
          <Button
            onPress={() => setIsAddDialogOpen(true)}
            leftIcon={<Feather name="plus-circle" size={18} color="white" />}
          >
            <Text style={styles.buttonText}>New Session</Text>
          </Button>
        </View>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Create and manage your practice or recording sessions
        </Text>

        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Add Session Dialog */}
        {isAddDialogOpen && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Session</Text>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                Enter a name for your new practice session.
              </Text>

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
                placeholder="My Practice Session"
                placeholderTextColor={colors.muted}
                value={newSessionName}
                onChangeText={setNewSessionName}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={() => {
                    setIsAddDialogOpen(false)
                    setNewSessionName("")
                  }}
                  style={styles.modalButton}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Button>
                <Button onPress={handleAddSession} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Create</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 16,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  sessionSongs: {
    fontSize: 14,
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
})

