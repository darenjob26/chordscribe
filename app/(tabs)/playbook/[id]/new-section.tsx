import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "@/components/theme-provider"
import ThemedButton from "@/components/ui/TButton"
import { Picker } from "@react-native-picker/picker"
import { Chord, Line, Section } from "@/types/chord"
import { CHORD_ROOTS, CHORD_QUALITIES, CHORD_INTERVALS, TIMING_OPTIONS } from "@/constants/chords"

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
  const [selectedRoot, setSelectedRoot] = useState<string | null>("C")
  const [selectedQuality, setSelectedQuality] = useState<string>("maj")
  const [selectedInterval, setSelectedInterval] = useState<string>("none")
  const [selectedTiming, setSelectedTiming] = useState<number>(4)
  const [isSlashChord, setIsSlashChord] = useState(false)
  const [selectedBass, setSelectedBass] = useState<string | undefined>(undefined)

  const handleAddChord = () => {
    if (!selectedRoot) return
    if (isSlashChord && !selectedBass) return

    const newChord: Chord = {
      id: `chord-${Date.now()}`,
      root: selectedRoot,
      quality: selectedQuality,
      interval: selectedInterval,
      ...(isTimedMode && { timing: selectedTiming }),
      ...(isSlashChord && { bass: selectedBass })
    }

    setCurrentLine(prev => ({
      ...prev,
      chords: [...prev.chords, newChord]
    }))

    // Reset selections
    setSelectedQuality("maj")
    setSelectedInterval("none")
    setIsSlashChord(false)
    setSelectedBass(undefined)
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
    if (chord.bass) display += `/${chord.bass}`
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

        {/* Chord Builder */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>Build Chord</Text>

          {/* Mode Toggle */}
          <View className="flex-row items-center gap-2 mb-4">
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
            {/* horizontal separator */}
            <View className="h-[20px] w-[1px] bg-border mx-1 bg-gray-500"></View>

            <ThemedButton
              size="sm"
              onPress={() => setIsSlashChord(!isSlashChord)}
              title="Slash"
              variant={isSlashChord ? "default" : "outline"}
            />
          </View>

          {/* Picker Chord builder */}
          <View className="flex-row mb-4">
            <View className="flex-1">
              <Picker
                selectedValue={selectedRoot}
                onValueChange={setSelectedRoot}
              >
                {CHORD_ROOTS.map(root => (
                  <Picker.Item key={root} label={root} value={root} />
                ))}
              </Picker>
            </View>
            <View className="flex-1">
              <Picker
                selectionColor={"black"}
                selectedValue={selectedQuality}
                onValueChange={setSelectedQuality}
              >
                {CHORD_QUALITIES.map(quality => (
                  <Picker.Item key={quality} label={quality} value={quality} />
                ))}
              </Picker>
            </View>
            <View className="flex-1">
              <Picker
                selectionColor={"black"}
                selectedValue={selectedInterval}
                onValueChange={setSelectedInterval}
              >
                {CHORD_INTERVALS.map(interval => (
                  <Picker.Item key={interval} label={interval} value={interval} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Bass Note Selection (for slash chords) */}
          {isSlashChord && (
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2" style={{ color: colors.muted }}>Bass Note</Text>
              <View className="flex-row flex-wrap gap-2">
                {CHORD_ROOTS.map(root => (
                  <TouchableOpacity
                    key={root}
                    className={`py-2 px-3 rounded-lg border ${selectedBass === root ? 'bg-primary border-primary' : 'border-border'}`}
                    onPress={() => setSelectedBass(root)}
                  >
                    <Text style={{ color: selectedBass === root ? '#fff' : colors.text }}>{root}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

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

          <View className="flex-row gap-2">
            <View className="flex-1">
              <ThemedButton
                title="Add Chord"
                onPress={handleAddChord}
                disabled={!selectedRoot || (isSlashChord && !selectedBass)}
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
                <Text className="text-xl" style={{ color: colors.primary }}>{formatChordDisplay(chord)}</Text>
                {chord.timing && (
                  <View className="ml-1 w-6 h-6 rounded-full bg-primary items-center justify-center">
                    <Text className="text-sm text-white">{chord.timing}</Text>
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
            <View className="p-4 border rounded-lg border-border">
              {lines.map((line, index) => (
                <View key={line.id} className="mb-2">
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
          </View>
        )}
      </ScrollView>
    </View>
  )
} 