"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Picker } from "@react-native-picker/picker"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import ThemedButton from "@/components/ui/TButton"
import { router as Router } from 'expo-router'
import { Song, Section, Chord } from "@/types/chord"
import { KEY_OPTIONS } from "@/constants/chords"

export default function AddSongScreen() {
  const router = useRouter()
  const { id, newSection } = useLocalSearchParams<{ id: string; newSection?: string }>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const [songTitle, setSongTitle] = useState("")
  const [songKey, setSongKey] = useState("C")
  const [sections, setSections] = useState<Section[]>([
    {
      id: "mock-intro",
      name: "Intro",
      lines: [
        {
          id: "line-1",
          chords: [
            { id: "chord-1", root: "C", quality: "maj", interval: "none", timing: 4 },
            { id: "chord-2", root: "G", quality: "maj", interval: "none" },
            { id: "chord-3", root: "A", quality: "m", interval: "none" },
            { id: "chord-4", root: "F", quality: "maj", interval: "none" },
          ]
        },
        {
          id: "line-2",
          chords: [
            { id: "chord-5", root: "C", quality: "maj", interval: "7" },
            { id: "chord-6", root: "G", quality: "maj", interval: "7" },
            { id: "chord-7", root: "F", quality: "maj", interval: "maj7" },
          ]
        }
      ]
    }
  ])

  const headerHeight = insets.top + 30;

  // Handle new section data from modal
  useEffect(() => {
    if (newSection) {
      const sectionData = JSON.parse(newSection)
      setSections(prev => [...prev, sectionData])
    }
  }, [newSection])

  const handleAddSection = () => {
    router.push({
      pathname: '/(tabs)/playbook/[id]/new-section',
      params: { id }
    })
  }

  const handleEditSection = (section: Section) => {
    router.push({
      pathname: '/(tabs)/playbook/[id]/new-section',
      params: {
        id,
        editSection: JSON.stringify(section)
      }
    })
  }

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId))
  }

  const handleSaveSong = () => {
    if (!songTitle.trim()) {
      Alert.alert("Error", "Please enter a song title")
      return
    }

    if (sections.length === 0) {
      Alert.alert("Error", "Please add at least one section")
      return
    }

    // In a real app, you would save the song to your backend
    console.log("Saving song:", { songTitle, songKey, sections })

    // Navigate back to the playbook
    router.back()
  }

  const formatChordDisplay = (chord: Chord): string => {
    let display = chord.root
    if (chord.quality !== "maj") display += chord.quality
    if (chord.interval !== "none") display += chord.interval
    return display
  }

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

          {sections.map((section) => (
            <View
              key={section.id}
              className="rounded-lg border mb-3 p-4"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                  {section.name}
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleEditSection(section)}
                  >
                    <Feather name="edit-2" size={20} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleDeleteSection(section.id)}
                  >
                    <Feather name="trash-2" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              {section.lines.map((line, lineIndex) => (
                <View key={line.id} className="mb-2">
                  <View className="flex-row flex-wrap gap-3">
                    {line.chords.map(chord => (
                      <View
                        key={chord.id}
                        className="flex-row justify-center items-center p-2 rounded-lg min-w-[45px] relative"
                        style={{ backgroundColor: colors.primaryLight }}
                      >
                        <Text style={{ color: colors.primary }}>{formatChordDisplay(chord)}</Text>
                        {chord.timing && (
                          <View className="ml-1 w-5 h-5 rounded-full bg-primary items-center justify-center absolute -top-2 -right-2">
                            <Text className="text-sm text-white">{chord.timing}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ))}

          {sections.length === 0 && (
            <View className="items-center justify-center py-8">
              <Text className="text-base text-muted mb-2">No sections added yet</Text>
              <Text className="text-sm text-muted">Tap the Add Section button to create a new section</Text>
            </View>
          )}
        </View>

        <ThemedButton
          onPress={handleSaveSong}
          leftIcon={<Feather name="save" size={18} color="white" />}
          title="Save Song"
        />
      </ScrollView>
    </View>
  )
}

