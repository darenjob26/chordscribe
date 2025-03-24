"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useRouter, usePathname } from "expo-router"
import { useTheme } from "@/components/theme-provider"

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
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.leftContainer}>
        {showBackButton ? (
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
            <Feather name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {headerTitle}
      </Text>

      <View style={styles.rightContainer} />
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

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  leftContainer: {
    width: 40,
  },
  rightContainer: {
    width: 40,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
})

