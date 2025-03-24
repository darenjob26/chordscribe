"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

// Types
interface Chord {
  id: string
  root: string
  quality: string
  interval: string
  timing?: string
}

interface Line {
  id: string
  chords: Chord[]
}

interface Section {
  id: string
  name: string
  lines: Line[]
}

interface Song {
  id: string
  title: string
  key: string
  sections: Section[]
  content?: string // For backward compatibility with mock data
}

interface Playbook {
  id: string
  name: string
  isDefault?: boolean
  songs: Song[]
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
        sections: [
          {
            id: "section-1",
            name: "A Section",
            lines: [
              {
                id: "line-1",
                chords: [
                  { id: "chord-1", root: "A", quality: "m", interval: "7" },
                  { id: "chord-2", root: "D", quality: "", interval: "7" },
                  { id: "chord-3", root: "G", quality: "maj", interval: "7" },
                  { id: "chord-4", root: "C", quality: "maj", interval: "7" },
                ],
              },
              {
                id: "line-2",
                chords: [
                  { id: "chord-5", root: "F#", quality: "m", interval: "7b5" },
                  { id: "chord-6", root: "B", quality: "", interval: "7" },
                  { id: "chord-7", root: "E", quality: "m", interval: "" },
                  { id: "chord-8", root: "E", quality: "m", interval: "" },
                ],
              },
            ],
          },
        ],
      },
      // Other songs...
    ],
  },
  // Other playbooks...
}

export default function SongDetailScreen() {
  const router = useRouter()
  const { id, songId } = useLocalSearchParams<{ id: string; songId: string }>()
  const { colors, isDark } = useTheme()

  const [song, setSong] = useState<Song | null>(null)
  const [playbookName, setPlaybookName] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // In a real app, you would fetch the song data from an API
    const playbook = mockPlaybooks[id as string]
    if (playbook) {
      setPlaybookName(playbook.name)
      const foundSong = playbook.songs.find((s) => s.id === songId)
      if (foundSong) {
        setSong(foundSong)
      }
    }
  }, [id, songId])

  const handleDeleteSong = () => {
    // In a real app, you would delete the song via an API
    setIsDeleteDialogOpen(false)
    router.back()
  }

  // Update the formatChordDisplay function to handle timing display
  const formatChordDisplay = (chord: Chord): string => {
    let display = chord.root

    if (chord.quality && chord.quality !== "maj") {
      display += chord.quality
    }

    if (chord.interval && chord.interval !== "none") {
      display += chord.interval
    }

    return display
  }

  if (!song) {
    return (
      <MainLayout>
        <View style={styles.container}>
          <Text>Song not found</Text>
        </View>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {song.title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Key: {song.key}</Text>
            </View>
            <Feather name="music" size={24} color={colors.primary} />
          </View>

          <View style={styles.actionButtons}>
            <Button
              variant="outline"
              onPress={() => router.push(`/playbook/${id}/edit-song/${songId}`)}
              leftIcon={<Feather name="edit-2" size={16} color={colors.text} />}
              style={styles.actionButton}
            >
              <Text style={{ color: colors.text }}>Edit Song</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => setIsDeleteDialogOpen(true)}
              leftIcon={<Feather name="trash-2" size={16} color={colors.error} />}
              style={styles.actionButton}
            >
              <Text style={{ color: colors.error }}>Delete</Text>
            </Button>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.songCard, { backgroundColor: isDark ? "#1a1a2e" : "#1a1a2e" }]}>
            <ScrollView contentContainerStyle={styles.songContent}>
              {song.sections.map((section) => (
                <View key={section.id} style={styles.section}>
                  <Text style={[styles.sectionName, { color: "#78E3FD" }]}>{section.name}</Text>

                  {section.lines.map((line) => (
                    <View key={line.id} style={styles.line}>
                      {line.chords.some((chord) => chord.timing) ? (
                        <View style={styles.timedChords}>
                          {line.chords.map((chord) => (
                            <View key={chord.id} style={styles.timedChord}>
                              <Text style={styles.chordText}>{formatChordDisplay(chord)}</Text>
                              {chord.timing && (
                                <View style={styles.timingBadge}>
                                  <Text style={styles.timingText}>{chord.timing}</Text>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.chordLine}>
                          {line.chords.map((chord) => formatChordDisplay(chord)).join(" | ")}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>

          <Button
            onPress={() => setIsPlaying(!isPlaying)}
            leftIcon={<Feather name={isPlaying ? "pause" : "play"} size={18} color="white" />}
            style={styles.playButton}
          >
            <Text style={styles.buttonText}>{isPlaying ? "Stop Playback" : "Play Progression"}</Text>
          </Button>
        </ScrollView>

        {/* Delete Confirmation Dialog */}
        {isDeleteDialogOpen && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Song</Text>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                Are you sure you want to delete "{song.title}"? This action cannot be undone.
              </Text>

              <View style={styles.modalButtons}>
                <Button variant="outline" onPress={() => setIsDeleteDialogOpen(false)} style={styles.modalButton}>
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Button>
                <Button variant="destructive" onPress={handleDeleteSong} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Delete Song</Text>
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
    marginBottom: 16,
  },
  titleRow: {
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
  subtitle: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  songCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  songContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  line: {
    marginBottom: 12,
  },
  chordLine: {
    fontFamily: "monospace",
    fontSize: 20,
    color: "#FFC857",
  },
  timedChords: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timedChord: {
    position: "relative",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chordText: {
    fontFamily: "monospace",
    fontSize: 20,
    color: "#FFC857",
  },
  timingBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
  },
  timingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  playButton: {
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
})

