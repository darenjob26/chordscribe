import { View, Text, ScrollView } from "react-native"
import { useTheme } from "@/providers/theme-provider"
import { Chord, Section } from "@/types/chord"

interface ChordProgressionPreviewProps {
  sections: Section[]
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export default function ChordProgressionPreview({
  sections,
  showActions = false,
  onEdit,
  onDelete
}: ChordProgressionPreviewProps) {
  const { colors, isDark } = useTheme()

  const formatChordDisplay = (chord: Chord): string => {
    let display = chord.root

    if (chord.quality && chord.quality !== "maj") {
      display += chord.quality
    }

    if (chord.interval && chord.interval !== "none") {
      display += chord.interval
    }

    if (chord.bass) {
      display += '/' + chord.bass
    }

    return display
  }

  console.log(JSON.stringify(sections, null, 2))

  return (
    <View className="rounded-xl overflow-hidden mb-4" style={{ backgroundColor: isDark ? "#1a1a2e" : "#1a1a2e" }}>
      <ScrollView className="p-4">
        {sections.map((section) => (
          <View key={section.id} className="mb-4">
            <Text className="text-xl font-bold mb-6" style={{ color: "#78E3FD" }}>{section.name}</Text>

            {section.lines.map((line) => (
              <View key={line.id} className="mb-3">
                <View className="flex-row flex-wrap gap-3">
                  {line.chords.map((chord, index) => (
                    <View key={chord.id} className="flex-row items-center">
                      <View className="relative px-1 py-2">
                        <Text className="font-mono text-2xl" style={{ color: "#FFC857" }}>{formatChordDisplay(chord)}</Text>
                        {chord.timing && chord.timing > 0 && (
                          <View className="absolute -top-2 inset-0 items-center justify-start gap-1">
                            {Array.from({ length: Math.ceil(chord.timing! / 4) || 1 })
                              .reverse()
                              .map((_, rowIndex) => (
                                <View key={rowIndex} className="flex-row gap-2">
                                  {Array.from({
                                    length: rowIndex === 0
                                      ?  Math.max(0, chord.timing! - 4)
                                      :  Math.min(4, chord.timing!)
                                  }).map((_, dotIndex) => (
                                    <View key={dotIndex}
                                      className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                    ></View>
                                  ))}
                                </View>
                              ))}
                          </View>
                        )}
                      </View>
                      {index < line.chords.length - 1 && (
                        <Text className="font-mono text-2xl mx-4" style={{ color: "#FFC857" }}>|</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  )
} 