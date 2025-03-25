import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "@/components/theme-provider"
import ThemedButton from "@/components/ui/TButton"

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

export default function NewSectionScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [sectionName, setSectionName] = useState("")
  const [isTimedMode, setIsTimedMode] = useState(false)
  const [currentLine, setCurrentLine] = useState<Line>({
    id: `line-${Date.now()}`,
    chords: []
  })
  const [lines, setLines] = useState<Line[]>([])

  // Current chord being built with defaults
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null)
  const [selectedQuality, setSelectedQuality] = useState<string>("maj")
  const [selectedInterval, setSelectedInterval] = useState<string>("none")
  const [selectedTiming, setSelectedTiming] = useState<number>(4)

  const handleAddChord = () => {
    if (!selectedRoot) return

    const newChord: Chord = {
      id: `chord-${Date.now()}`,
      root: selectedRoot,
      quality: selectedQuality,
      interval: selectedInterval,
      ...(isTimedMode && { timing: selectedTiming })
    }

    setCurrentLine(prev => ({
      ...prev,
      chords: [...prev.chords, newChord]
    }))

    // Reset only root selection
    setSelectedRoot(null)
    setSelectedQuality("maj")
    setSelectedInterval("none")
  }

  const handleDeleteChord = (chordId: string) => {
    setCurrentLine(prev => ({
      ...prev,
      chords: prev.chords.filter(chord => chord.id !== chordId)
    }))
  }

  const handleDeleteLine = (lineId: string) => {
    setLines(prev => prev.filter(line => line.id !== lineId))
  }

  const handleAddLine = () => {
    if (currentLine.chords.length > 0) {
      setLines(prev => [...prev, currentLine])
      setCurrentLine({
        id: `line-${Date.now()}`,
        chords: []
      })
    }
  }

  const handleSaveSection = () => {
    if (!sectionName.trim()) {
      alert("Please enter a section name")
      return
    }

    // Add the current line if it has chords
    const finalLines = currentLine.chords.length > 0
      ? [...lines, currentLine]
      : lines

    if (finalLines.length === 0) {
      alert("Please add at least one chord")
      return
    }

    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: sectionName,
      lines: finalLines
    }

    // Pass the section back to the previous screen using setParams
    router.setParams({ newSection: JSON.stringify(newSection) })
    router.back()
  }

  const formatChordDisplay = (chord: Chord): string => {
    let display = chord.root
    if (chord.quality !== "maj") display += chord.quality
    if (chord.interval !== "none") display += chord.interval
    return display
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>New Section</Text>
        <TouchableOpacity onPress={handleSaveSection}>
          <Text className="text-primary">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Section Name */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>Section Name</Text>
          <TextInput
            className="h-[50px] border rounded-lg px-4 text-base"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.text,
            }}
            placeholder="Enter section name (e.g., Intro, Verse, Chorus)"
            placeholderTextColor={colors.muted}
            value={sectionName}
            onChangeText={setSectionName}
          />
        </View>

        {/* Mode Toggle */}
        <View className="flex-row items-center gap-2 mb-6">
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

        {/* Chord Builder */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-4" style={{ color: colors.text }}>Build Chord</Text>

          {/* Timing (if in timed mode) */}
          {isTimedMode && (
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2" style={{ color: colors.muted }}>Timing (seconds)</Text>
              <View className="flex-row flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(timing => (
                  <TouchableOpacity
                    key={timing}
                    className={`py-2 px-3 rounded-lg border ${selectedTiming === timing ? 'bg-primary border-primary' : 'border-border'}`}
                    onPress={() => setSelectedTiming(timing)}
                  >
                    <Text style={{ color: selectedTiming === timing ? '#fff' : colors.text }}>{timing}s</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View className="flex-row mb-4">
            {/* Root Notes (75%) */}
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium mb-2" style={{ color: colors.muted }}>Root Note</Text>
              <View className="flex-row flex-wrap gap-2">
                {CHORD_ROOTS.map(root => (
                  <TouchableOpacity
                    key={root}
                    className={`py-2 px-3 rounded-lg border ${selectedRoot === root ? 'bg-primary border-primary' : 'border-border'}`}
                    onPress={() => setSelectedRoot(root)}
                  >
                    <Text style={{ color: selectedRoot === root ? '#fff' : colors.text }}>{root}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-1">
              {/* Qualities (25%) */}
              <View className="mb-2">
                <Text className="text-sm font-medium mb-2" style={{ color: colors.muted }}>Quality</Text>
                <View className="flex-row flex-wrap gap-2">
                  {CHORD_QUALITIES.map(quality => (
                    <TouchableOpacity
                      key={quality}
                      className={`py-2 px-3 rounded-lg border ${selectedQuality === quality ? 'bg-primary border-primary' : 'border-border'}`}
                      onPress={() => setSelectedQuality(quality)}
                    >
                      <Text style={{ color: selectedQuality === quality ? '#fff' : colors.text }}>{quality}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Intervals */}
              <View className="">
                <Text className="text-sm font-medium mb-2" style={{ color: colors.muted }}>Interval</Text>
                <View className="flex-row flex-wrap gap-2">
                  {CHORD_INTERVALS.map(interval => (
                    <TouchableOpacity
                      key={interval}
                      className={`py-2 px-3 rounded-lg border ${selectedInterval === interval ? 'bg-primary border-primary' : 'border-border'}`}
                      onPress={() => setSelectedInterval(interval)}
                    >
                      <Text style={{ color: selectedInterval === interval ? '#fff' : colors.text }}>{interval}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <ThemedButton
                title="Add Chord"
                onPress={handleAddChord}
                disabled={!selectedRoot}
              />
            </View>
            <View className="flex-1">
              <ThemedButton
                variant="outline"
                title="New Line"
                onPress={handleAddLine}
                disabled={currentLine.chords.length === 0}
              />
            </View>
          </View>
        </View>

        {/* Current Line Preview */}
        <View className="mb-6 p-4 border rounded-lg border-border">
          <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>Current Line</Text>
          <View className="flex-row flex-wrap gap-2">
            {currentLine.chords.map((chord) => (
              <TouchableOpacity
                key={chord.id}
                onPress={() => handleDeleteChord(chord.id)}
                className="flex-row items-center p-2 rounded-lg"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Text style={{ color: colors.primary }}>{formatChordDisplay(chord)}</Text>
                {chord.timing && (
                  <View className="ml-1 w-4 h-4 rounded-full bg-primary items-center justify-center">
                    <Text className="text-xs text-white">{chord.timing}</Text>
                  </View>
                )}
                <View className="ml-2">
                  <Feather name="x" size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SectionPreview */}
        {lines.length > 0 && (
          <View className="mb-6">
            <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>{sectionName} Preview</Text>
            {lines.map((line, index) => (
              <View key={line.id} className="p-4 border rounded-lg border-border mb-2">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-medium" style={{ color: colors.muted }}>Line {index + 1}</Text>
                  <TouchableOpacity onPress={() => handleDeleteLine(line.id)}>
                    <Feather name="trash-2" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap gap-4">
                  {line.chords.map(chord => (
                    <View
                      key={chord.id}
                      className="flex-row items-center p-2 rounded-lg relative"
                      style={{ backgroundColor: colors.primaryLight }}
                    >
                      <Text style={{ color: colors.primary }}>{formatChordDisplay(chord)}</Text>
                      {chord.timing && (
                        <View className="ml-1 w-4 h-4 rounded-full bg-primary items-center justify-center absolute -top-2 -right-2">
                          <Text className="text-xs text-white">{chord.timing}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
} 