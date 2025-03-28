"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "@/providers/theme-provider"
import ThemedButton from "@/components/ui/TButton"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { usePlaybook } from "@/providers/PlaybookProvider"
import ChordProgressionPreview from "@/components/ChordProgressionPreview"

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

interface Song {
  id: string
  title: string
  key: string
  sections: Section[]
  content?: string // For backward compatibility with mock data
}

export default function SongDetailScreen() {
  const router = useRouter()
  const { id, songId } = useLocalSearchParams<{ id: string; songId: string }>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { getPlaybook } = usePlaybook()

  const [song, setSong] = useState<Song | null>(null)
  const [playbookName, setPlaybookName] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    loadSong()
  }, [id, songId])

  const loadSong = async () => {
    try {
      const playbook = await getPlaybook(id)
      if (playbook) {
        setPlaybookName(playbook.name)
        const foundSong = playbook.songs.find((s) => s.id === songId)
        if (foundSong) {
          setSong(foundSong)
        }
      }
    } catch (error) {
      console.error("Failed to load song:", error)
    }
  }

  const handleDeleteSong = () => {
    // In a real app, you would delete the song via an API
    setIsDeleteDialogOpen(false)
    router.back()
  }

  if (!song) {
    return (
      <View className="flex-1 justify-center items-center gap-2">
        <Text>Song not found</Text>
        <ThemedButton size="sm" title="Go back" onPress={() => router.back()} />
      </View>
    )
  }

  const headerHeight = insets.top + 30

  return (
    <View className="flex-1 p-4" style={{ paddingTop: headerHeight }}>
      <View className="mb-8">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity className="mr-4" onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: colors.text }} numberOfLines={1}>
              {song.title}
            </Text>
            <Text className="text-base" style={{ color: colors.muted }}>Key: {song.key}</Text>
          </View>
          <Feather name="music" size={24} color={colors.primary} />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <ThemedButton
              variant="outline"
              title="Edit Song"
              onPress={() => router.push(`/playbook/${id}/edit-song/${songId}`)}
              leftIcon={<Feather name="edit-2" size={16} color={colors.text} />}
            />
          </View>
          <View className="flex-1">
            <ThemedButton
              variant="outline"
              title="Delete"
              onPress={() => setIsDeleteDialogOpen(true)}
              leftIcon={<Feather name="trash-2" size={16} color={colors.error} />}
            />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ChordProgressionPreview sections={song.sections} />
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center p-4">
          <View className="w-full rounded-xl p-6" style={{ backgroundColor: colors.background }}>
            <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>Delete Song</Text>
            <Text className="text-base mb-6" style={{ color: colors.muted }}>
              Are you sure you want to delete "{song.title}"? This action cannot be undone.
            </Text>

            <View className="flex-row justify-end gap-3">
              <View style={{ minWidth: 100 }}>
                <ThemedButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => setIsDeleteDialogOpen(false)}
                />
              </View>
              <View style={{ minWidth: 100 }}>
                <ThemedButton
                  title="Delete Song"
                  variant="destructive"
                  onPress={handleDeleteSong}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

