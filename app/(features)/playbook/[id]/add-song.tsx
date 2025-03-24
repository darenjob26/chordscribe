"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Picker } from "@react-native-picker/picker"

// Types
interface Chord {
  id: string
  root: string
  quality: string
  interval: string
  timing?: number
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

// Constants
const CHORD_ROOTS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"]
const CHORD_QUALITIES = ["maj", "min", "dim", "aug", "sus2", "sus4"]
const CHORD_INTERVALS = ["none", "7", "maj7", "6", "9", "11", "13", "add9", "add11"]
const KEY_OPTIONS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"]

export default function AddSongScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()

  const [songTitle, setSongTitle] = useState("")
  const [songKey, setSongKey] = useState("C")
  const [sections, setSections] = useState<Section[]>([
    {
      id: `section-${Date.now()}`,
      name: "Intro",
      lines: [
        {
          id: `line-${Date.now()}`,
          chords: [],
        },
      ],
    },
  ])

  // Current chord being added
  const [currentRoot, setCurrentRoot] = useState("C")
  const [currentQuality, setCurrentQuality] = useState("maj")
  const [currentInterval, setCurrentInterval] = useState("none")

  // For accordion state
  const [expandedSections, setExpandedSections] = useState<string[]>([`section-${Date.now()}`])

  // Add a new state for timed mode toggle
  const [isTimedMode, setIsTimedMode] = useState(false)
  const [currentTiming, setCurrentTiming] = useState(4) // Default to 4 seconds

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: "",
      lines: [
        {
          id: `line-${Date.now()}`,
          chords: [],
        },
      ],
    }

    setSections([...sections, newSection])
    setExpandedSections([...expandedSections, newSection.id])
  }

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) {
      Alert.alert("Error", "You must have at least one section")
      return
    }
    setSections(sections.filter((section) => section.id !== sectionId))
    setExpandedSections(expandedSections.filter((id) => id !== sectionId))
  }

  const handleSectionNameChange = (sectionId: string, name: string) => {
    setSections(sections.map((section) => (section.id === sectionId ? { ...section, name } : section)))
  }

  const handleAddChord = (sectionId: string, lineId: string) => {
    const newChord: Chord = {
      id: `chord-${Date.now()}`,
      root: currentRoot,
      quality: currentQuality,
      interval: currentInterval,
      ...(isTimedMode && { timing: currentTiming }),
    }

    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lines: section.lines.map((line) => {
              if (line.id === lineId) {
                return {
                  ...line,
                  chords: [...line.chords, newChord],
                }
              }
              return line
            }),
          }
        }
        return section
      }),
    )
  }

  const handleDeleteChord = (sectionId: string, lineId: string, chordId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lines: section.lines.map((line) => {
              if (line.id === lineId) {
                return {
                  ...line,
                  chords: line.chords.filter((chord) => chord.id !== chordId),
                }
              }
              return line
            }),
          }
        }
        return section
      }),
    )
  }

  const handleAddLine = (sectionId: string) => {
    const newLine: Line = {
      id: `line-${Date.now()}`,
      chords: [],
    }

    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lines: [...section.lines, newLine],
          }
        }
        return section
      }),
    )
  }

  const handleDeleteLine = (sectionId: string, lineId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          // Don't delete the last line
          if (section.lines.length <= 1) {
            return section
          }

          return {
            ...section,
            lines: section.lines.filter((line) => line.id !== lineId),
          }
        }
        return section
      }),
    )
  }

  const formatChordDisplay = (chord: Chord): string => {
    let display = chord.root

    if (chord.quality !== "maj") {
      display += chord.quality
    }

    if (chord.interval !== "none") {
      display += chord.interval
    }

    return display
  }

  const handleSaveSong = () => {
    if (!songTitle.trim()) {
      Alert.alert("Error", "Please enter a song title")
      return
    }

    // In a real app, you would save the song to your backend
    console.log("Saving song:", { songTitle, songKey, sections })

    // Navigate back to the playbook
    router.back()
  }

  const toggleSectionExpanded = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter((id) => id !== sectionId))
    } else {
      setExpandedSections([...expandedSections, sectionId])
    }
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Add New Song</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Song Details */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Song Details</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Song Title</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                placeholder="Enter song title"
                placeholderTextColor={colors.muted}
                value={songTitle}
                onChangeText={setSongTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Original Key</Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <Picker
                  selectedValue={songKey}
                  onValueChange={(itemValue) => setSongKey(itemValue)}
                  style={{ color: colors.text }}
                  dropdownIconColor={colors.text}
                >
                  {KEY_OPTIONS.map((key) => (
                    <Picker.Item key={key} label={key} value={key} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Sections */}
          <View style={styles.sectionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Sections</Text>
              <Button onPress={handleAddSection} leftIcon={<Feather name="plus" size={16} color="white" />}>
                <Text style={styles.buttonText}>Add Section</Text>
              </Button>
            </View>

            {sections.map((section, sectionIndex) => (
              <View
                key={section.id}
                style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSectionExpanded(section.id)}>
                  <View style={styles.sectionTitleContainer}>
                    <TextInput
                      style={[styles.sectionTitleInput, { color: colors.text }]}
                      placeholder="Enter section name (e.g., Intro, Verse, Chorus)"
                      placeholderTextColor={colors.muted}
                      value={section.name}
                      onChangeText={(text) => handleSectionNameChange(section.id, text)}
                    />
                  </View>
                  <View style={styles.sectionActions}>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSection(section.id)}>
                      <Text style={{ color: colors.error }}>Delete</Text>
                    </TouchableOpacity>
                    <Feather
                      name={expandedSections.includes(section.id) ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={colors.text}
                    />
                  </View>
                </TouchableOpacity>

                {expandedSections.includes(section.id) && (
                  <View style={styles.sectionContent}>
                    {section.lines.map((line, lineIndex) => (
                      <View key={line.id} style={styles.lineContainer}>
                        {/* Chord display */}
                        {line.chords.length > 0 && (
                          <View style={styles.chordContainer}>
                            {line.chords.map((chord) => (
                              <View
                                key={chord.id}
                                style={[styles.chordBadge, { backgroundColor: colors.primaryLight }]}
                              >
                                <Text style={{ color: colors.primary }}>{formatChordDisplay(chord)}</Text>
                                <TouchableOpacity
                                  onPress={() => handleDeleteChord(section.id, line.id, chord.id)}
                                  style={styles.deleteChordButton}
                                >
                                  <Feather name="x" size={16} color={colors.muted} />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Chord input */}
                        <View style={styles.chordInputContainer}>
                          <View style={styles.modeToggle}>
                            <TouchableOpacity
                              style={[
                                styles.modeButton,
                                isTimedMode && { backgroundColor: colors.primary },
                                !isTimedMode && { borderColor: colors.border },
                              ]}
                              onPress={() => setIsTimedMode(true)}
                            >
                              <Text style={{ color: isTimedMode ? "white" : colors.text }}>Timed</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.modeButton,
                                !isTimedMode && { backgroundColor: colors.primary },
                                isTimedMode && { borderColor: colors.border },
                              ]}
                              onPress={() => setIsTimedMode(false)}
                            >
                              <Text style={{ color: !isTimedMode ? "white" : colors.text }}>Standard</Text>
                            </TouchableOpacity>
                          </View>

                          <View style={styles.chordPickers}>
                            <View
                              style={[
                                styles.pickerSmall,
                                {
                                  borderColor: colors.border,
                                  backgroundColor: colors.background,
                                },
                              ]}
                            >
                              <Picker
                                selectedValue={currentRoot}
                                onValueChange={setCurrentRoot}
                                style={{ color: colors.text }}
                                dropdownIconColor={colors.text}
                              >
                                {CHORD_ROOTS.map((root) => (
                                  <Picker.Item key={root} label={root} value={root} />
                                ))}
                              </Picker>
                            </View>

                            <View
                              style={[
                                styles.pickerSmall,
                                {
                                  borderColor: colors.border,
                                  backgroundColor: colors.background,
                                },
                              ]}
                            >
                              <Picker
                                selectedValue={currentQuality}
                                onValueChange={setCurrentQuality}
                                style={{ color: colors.text }}
                                dropdownIconColor={colors.text}
                              >
                                {CHORD_QUALITIES.map((quality) => (
                                  <Picker.Item key={quality} label={quality} value={quality} />
                                ))}
                              </Picker>
                            </View>

                            <View
                              style={[
                                styles.pickerSmall,
                                {
                                  borderColor: colors.border,
                                  backgroundColor: colors.background,
                                },
                              ]}
                            >
                              <Picker
                                selectedValue={currentInterval}
                                onValueChange={setCurrentInterval}
                                style={{ color: colors.text }}
                                dropdownIconColor={colors.text}
                              >
                                {CHORD_INTERVALS.map((interval) => (
                                  <Picker.Item key={interval} label={interval} value={interval} />
                                ))}
                              </Picker>
                            </View>

                            {isTimedMode && (
                              <View
                                style={[
                                  styles.pickerSmall,
                                  {
                                    borderColor: colors.border,
                                    backgroundColor: colors.background,
                                  },
                                ]}
                              >
                                <Picker
                                  selectedValue={currentTiming.toString()}
                                  onValueChange={(value) => setCurrentTiming(Number(value))}
                                  style={{ color: colors.text }}
                                  dropdownIconColor={colors.text}
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map((seconds) => (
                                    <Picker.Item
                                      key={seconds.toString()}
                                      label={`${seconds}s`}
                                      value={seconds.toString()}
                                    />
                                  ))}
                                </Picker>
                              </View>
                            )}
                          </View>

                          <View style={styles.lineActions}>
                            <Button
                              variant="outline"
                              onPress={() => handleAddChord(section.id, line.id)}
                              style={styles.actionButton}
                            >
                              <Text style={{ color: colors.text }}>Add Chord</Text>
                            </Button>

                            <Button
                              variant="outline"
                              onPress={() => handleAddLine(section.id)}
                              style={styles.actionButton}
                            >
                              <Text style={{ color: colors.text }}>New Line</Text>
                            </Button>

                            {section.lines.length > 1 && (
                              <TouchableOpacity
                                style={styles.deleteLineButton}
                                onPress={() => handleDeleteLine(section.id, line.id)}
                              >
                                <Feather name="trash-2" size={20} color={colors.error} />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Song Preview */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Song Preview</Text>

            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: colors.text }]}>{songTitle || "Untitled Song"}</Text>
              <Text style={[styles.previewSubtitle, { color: colors.muted }]}>Key: {songKey}</Text>
            </View>

            <View style={styles.previewContent}>
              {sections.map((section) => (
                <View key={section.id} style={styles.previewSection}>
                  <Text style={[styles.previewSectionName, { color: colors.primary }]}>
                    {section.name || "Unnamed Section"}
                  </Text>

                  {section.lines.map((line) => (
                    <View key={line.id} style={styles.previewLine}>
                      {line.chords.length > 0 ? (
                        isTimedMode ? (
                          <View style={styles.previewTimedChords}>
                            {line.chords.map((chord) => (
                              <View key={chord.id} style={styles.previewTimedChord}>
                                <Text style={[styles.previewChordText, { color: colors.text }]}>
                                  {formatChordDisplay(chord)}
                                </Text>
                                {chord.timing && (
                                  <View style={[styles.previewTimingBadge, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.previewTimingText}>{chord.timing}</Text>
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text style={[styles.previewChordLine, { color: colors.text }]}>
                            {line.chords.map((chord) => formatChordDisplay(chord)).join(" | ")}
                          </Text>
                        )
                      ) : (
                        <Text style={{ color: colors.muted, fontStyle: "italic" }}>No chords added</Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

          <Button
            onPress={handleSaveSong}
            style={styles.saveButton}
            leftIcon={<Feather name="save" size={18} color="white" />}
          >
            <Text style={styles.buttonText}>Save Song</Text>
          </Button>
        </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
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
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
  },
  sectionsContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitleInput: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginRight: 16,
  },
  sectionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  lineContainer: {
    marginBottom: 16,
  },
  chordContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 8,
  },
  chordBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteChordButton: {
    marginLeft: 4,
  },
  chordInputContainer: {
    gap: 12,
  },
  modeToggle: {
    flexDirection: "row",
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
    marginHorizontal: 4,
  },
  chordPickers: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  pickerSmall: {
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    width: 100,
    justifyContent: "center",
  },
  lineActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  deleteLineButton: {
    padding: 8,
  },
  previewHeader: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  previewSubtitle: {
    fontSize: 14,
  },
  previewContent: {
    gap: 16,
  },
  previewSection: {
    gap: 8,
  },
  previewSectionName: {
    fontSize: 16,
    fontWeight: "600",
  },
  previewLine: {
    marginBottom: 8,
  },
  previewChordLine: {
    fontFamily: "monospace",
    fontSize: 16,
  },
  previewTimedChords: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  previewTimedChord: {
    position: "relative",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewChordText: {
    fontFamily: "monospace",
    fontSize: 16,
  },
  previewTimingBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  previewTimingText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  saveButton: {
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
})

