"use client"
import { View, Text, TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useRouter, usePathname } from "expo-router"
import { useTheme } from "@/providers/theme-provider"

interface HeaderProps {
  onMenuPress: () => void
  title?: string
}

export function Header({ onMenuPress, title }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { colors } = useTheme()

  // Determine title based on pathname if not provided
  const headerTitle = title || getHeaderTitle(pathname)

  // Check if we need a back button
  const showBackButton = pathname !== "/" && pathname !== "/playbook" && pathname !== "/session"

  return (
    <View 
      className="h-16 flex-row items-center justify-between px-4 border-b border-gray-200"
      style={{ backgroundColor: colors.background }}
    >
      <View className="w-12">
        {showBackButton ? (
          <TouchableOpacity className="p-2" onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity className="p-2" onPress={onMenuPress}>
            <Feather name="menu" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <Text 
        className="text-base font-semibold flex-1 text-center"
        style={{ color: colors.text }}
        numberOfLines={1}
      >
        {headerTitle}
      </Text>

      <View className="w-12" />
    </View>
  )
}

function getHeaderTitle(pathname: string): string {
  if (pathname === "/") return "Home"
  if (pathname === "/playbook") return "Playbooks"
  if (pathname === "/session") return "Sessions"
  if (pathname.startsWith("/playbook/")) return "Playbook Details"
  if (pathname.startsWith("/auth/")) return "Authentication"

  // Default title
  return "ChordScribe"
}

