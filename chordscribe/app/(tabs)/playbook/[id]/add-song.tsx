"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "@/providers/theme-provider"
import { Picker } from "@react-native-picker/picker"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import ThemedButton from "@/components/ui/TButton"
import { router as Router } from 'expo-router'
import { Section, Chord } from "@/types/chord"
import { KEY_OPTIONS } from "@/constants/chords"
import ChordProgressionPreview from "@/components/ChordProgressionPreview"
import { useSong } from "@/providers/song-provider"
import { observer } from "@legendapp/state/react"
import { songStore$, userIdStore$ } from "@/services/store"
import { Song } from "@/types/playbook"
import { useAuth } from "@/providers/auth-provider"

export default observer(function AddSongScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { dbUser } = useAuth()

  const { sections, deleteSection, clearSections } = useSong()

  const [songTitle, setSongTitle] = useState("")
  const [songKey, setSongKey] = useState("C")

  const headerHeight = insets.top + 30;

  const handleAddSection = () => {
    router.push({
      pathname: '/(tabs)/playbook/[id]/new-or-edit-section',
      params: { id }
    })
  }

  const handleEditSection = (section: Section) => {
    router.push({
      pathname: '/(tabs)/playbook/[id]/new-or-edit-section',
      params: {
        id,
        editSection: JSON.stringify(section)
      }
    })
  }

  const handleDeleteSection = (sectionId: string) => {
    deleteSection(sectionId)
  }

  const handleSaveSong = async () => {
    if (!songTitle.trim()) {
      Alert.alert("Error", "Please enter a song title")
      return
    }

    if (sections.length === 0) {
      Alert.alert("Error", "Please add at least one section")
      return
    }

    try {
      const newSong: Song = {
        _id: `song-${Date.now()}`,
        userId: userIdStore$.userId.get(),
        playbookId: id,
        title: songTitle,
        key: songKey,
        sections,
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      songStore$.addSong(newSong)

      clearSections()
      router.back()
    } catch (error) {
      Alert.alert("Error", "Failed to save song")
    }
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

          {sections.length > 0 && <View
            className="rounded-lg border mb-3 p-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            {sections.map((section) => (
              <View key={section.id} >
                {/* Section Action Buttons */}
                <View className="flex-row justify-end mr-4 items-center relative">
                  <View className="flex-row gap-3 absolute top-4 z-10">
                    <TouchableOpacity
                      className="p-2 bg-white rounded"
                      onPress={() => handleEditSection(section)}
                    >
                      <Feather name="edit-2" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="p-2 bg-white rounded"
                      onPress={() => handleDeleteSection(section.id)}
                    >
                      <Feather name="trash-2" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ChordProgressionPreview sections={[section]} />
              </View>
            ))}
          </View>}

          {sections.length === 0 && (
            <View className="items-center justify-center py-8">
              <Text className="text-base text-muted mb-2">No sections added yet</Text>
              <Text className="text-sm text-muted">Tap the Add Section button to create a new section</Text>
            </View>
          )}
        </View>

        <ThemedButton
          size="lg"
          onPress={handleSaveSong}
          leftIcon={<Feather name="save" size={18} color="white" />}
          title="Save Song"
        />
      </ScrollView>
    </View>
  )
})

