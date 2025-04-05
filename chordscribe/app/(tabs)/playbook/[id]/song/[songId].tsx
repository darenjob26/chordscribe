"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "@/providers/theme-provider"
import ThemedButton from "@/components/ui/TButton"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import ChordProgressionPreview from "@/components/ChordProgressionPreview"
import { observer } from "@legendapp/state/react"
import { songStore$ } from "@/services/store"
import { Song } from "@/types/playbook"

export default observer(function SongDetailScreen() {
  const router = useRouter()
  const { id, songId } = useLocalSearchParams<{ id: string; songId: string }>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const [song, setSong] = useState<Song | null>(null)
  const [playbookName, setPlaybookName] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const song = songStore$.getSongById(songId)
    if(song) {
      setSong(song)
    }
  }, [id])

  const handleDeleteSong = (song: Song) => {
    // In a real app, you would delete the song via an API
    songStore$.removeSong(song)
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
                  onPress={() => handleDeleteSong(song)}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
})

