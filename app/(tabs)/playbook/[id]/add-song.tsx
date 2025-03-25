"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Picker } from "@react-native-picker/picker"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import ThemedButton from "@/components/ui/TButton";

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
  const insets = useSafeAreaInsets()
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

  const headerHeight = insets.top + 30;

  return (
    <View className="flex-1 p-4" style={{ paddingTop: headerHeight }}>
      <View className="flex-row items-center mb-4">
        <TouchableOpacity className="mr-4" onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>Add New Song</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Song Details */}
        <View className="rounded-lg border mb-4 p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>Song Details</Text>

          <View className="mb-4">
            <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>Song Title</Text>
            <TextInput
              className="h-[50px] border rounded-lg px-4 text-base"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text,
              }}
              placeholder="Enter song title"
              placeholderTextColor={colors.muted}
              value={songTitle}
              onChangeText={setSongTitle}
            />
          </View>

          <View className="mb-4">
            <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>Original Key</Text>
            <View
              className="border rounded-lg h-[50px] justify-center"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.background,
              }}
            >
              <Picker
                itemStyle={{ height: 50 }}
                selectedValue={songKey}
                onValueChange={(itemValue) => setSongKey(itemValue)}
                style={{ color: colors.text, backgroundColor: colors.background }}
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
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>Sections</Text>

            <ThemedButton
              onPress={handleAddSection}
              leftIcon={<Feather name="plus" size={16} color="white" />}
              title="Add Section"
            />
          </View>

          {sections.map((section, sectionIndex) => (
            <View
              key={section.id}
              className="rounded-lg border mb-3 overflow-hidden"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <TouchableOpacity className="flex-row justify-between items-center p-4" onPress={() => toggleSectionExpanded(section.id)}>
                <View className="flex-1">
                  <TextInput
                    className="text-base font-medium"
                    style={{ color: colors.text }}
                    placeholder="Enter section name (e.g., Intro, Verse, Chorus)"
                    placeholderTextColor={colors.muted}
                    value={section.name}
                    onChangeText={(text) => handleSectionNameChange(section.id, text)}
                  />
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity className="mr-4" onPress={() => handleDeleteSection(section.id)}>
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
                <View className="p-4 border-t border-gray-200">
                  {section.lines.map((line, lineIndex) => (
                    <View key={line.id} className="mb-4 gap-2">
                      {/* Chord display */}
                      {line.chords.length > 0 && (
                        <View className="flex flex-row flex-wrap mb-2 gap-2">
                          {line.chords.map((chord) => (
                            <View
                              key={chord.id}
                              className="flex flex-row items-center p-2 rounded-lg"
                              style={{ backgroundColor: colors.primaryLight }}
                            >
                              <Text className="text-sm font-medium text-primary">{formatChordDisplay(chord)}</Text>
                              <TouchableOpacity
                                className="ml-2"
                                onPress={() => handleDeleteChord(section.id, line.id, chord.id)}
                              >
                                <Feather name="x" size={16} color={colors.muted} />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}

                      {line.chords.length > 0 && (
                        <View className="w-full border-[.5px] border-gray-300 my-2"></View>
                      )}

                      <View className="flex flex-row items-center justify-between">
                        <View className="flex flex-row items-center rounded-lg gap-2">
                          <ThemedButton
                            size="sm"
                            onPress={() => setIsTimedMode(false)}
                            title="Standard"
                            variant={!isTimedMode ? "default" : "outline"}
                          />
                          <ThemedButton
                            size="sm"
                            onPress={() => setIsTimedMode(true)}
                            title="Timed"
                            variant={isTimedMode ? "default" : "outline"}
                          />
                        </View>

                        {section.lines.length > 1 && (
                          <TouchableOpacity
                            className="p-2"
                            onPress={() => handleDeleteLine(section.id, line.id)}
                          >
                            <Feather name="trash-2" size={20} color={colors.error} />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Chord input */}
                      <View className="flex flex-row items-center gap-2">
                        <View className="flex flex-row gap-2 w-full">

                          <View className="border rounded-lg p-2 flex-1" >
                            <Picker
                              itemStyle={{ height: 40, fontSize: 12 }}
                              selectedValue={currentRoot}
                              onValueChange={setCurrentRoot}
                              dropdownIconColor={colors.text}
                            >
                              {CHORD_ROOTS.map((root) => (
                                <Picker.Item key={root} label={root} value={root} />
                              ))}
                            </Picker>
                          </View>

                          <View className="border rounded-lg p-2 flex-1">
                            <Picker
                              itemStyle={{ height: 40, fontSize: 12 }}
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

                          <View className="border rounded-lg p-2 flex-1">
                            <Picker
                              itemStyle={{ height: 40, fontSize: 12 }}
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
                            <View className="border rounded-lg p-2 flex-1">
                              <Picker
                                itemStyle={{ height: 40, fontSize: 12 }}
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
                      </View>
                      
                      <View className="flex flex-row items-center gap-2">
                        <ThemedButton
                          size="sm"
                          onPress={() => handleAddChord(section.id, line.id)}
                          title="Add Chord"
                        />
                        {line.chords.length > 0 && <ThemedButton
                          size="sm"
                          variant="outline"
                          onPress={() => handleAddLine(section.id)}
                          title="New Line"
                        />}

                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Song Preview */}
        <View className="rounded-lg border mb-4 p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>Song Preview</Text>

          <View className="mb-4">
            <Text className="text-base font-bold mb-2">{songTitle || "Untitled Song"}</Text>
            <Text className="text-sm text-muted">Key: {songKey}</Text>
          </View>

          <View className="gap-4">
            {sections.map((section) => (
              <View key={section.id} className="gap-2">
                <Text className="text-base font-medium">{section.name || "Unnamed Section"}</Text>

                {section.lines.map((line) => (
                  <View key={line.id} className="text-base">
                    {line.chords.length > 0 ? (
                      isTimedMode ? (
                        <View className="flex flex-row flex-wrap gap-2">
                          {line.chords.map((chord) => (
                            <View key={chord.id} className="flex flex-row items-center gap-2">
                              <Text className="text-base">{formatChordDisplay(chord)}</Text>
                              {chord.timing && (
                                <View className="flex items-center justify-center w-4 h-4 rounded-full" style={{ backgroundColor: colors.primary }}>
                                  <Text className="text-xs text-white font-bold">{chord.timing}</Text>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text className="text-base">{line.chords.map((chord) => formatChordDisplay(chord)).join(" | ")}</Text>
                      )
                    ) : (
                      <Text className="text-sm text-muted italic">No chords added</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        <Button
          onPress={handleSaveSong}
          className="mt-4"
          leftIcon={<Feather name="save" size={18} color="white" />}
        >
          <Text className="text-white text-base font-medium">Save Song</Text>
        </Button>
      </ScrollView>
    </View>
  )
}

