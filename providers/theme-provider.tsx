"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"

// Define theme colors
const lightTheme = {
  background: "#ffffff",
  card: "#f9fafb",
  text: "#1f2937",
  border: "#e5e5e5",
  primary: "#3E6990",
  primaryLight: "#e0e7ff",
  secondary: "#007EA7",
  accent: "#10b981",
  muted: "#9ca3af",
  error: "#ef4444",
}

const darkTheme = {
  background: "#1f2937",
  card: "#374151",
  text: "#f9fafb",
  border: "#4b5563",
  primary: "#3E6990",
  primaryLight: "#312e81",
  secondary: "#a78bfa",
  accent: "#34d399",
  muted: "#6b7280",
  error: "#f87171",
}

type ThemeColors = typeof lightTheme

interface ThemeContextType {
  isDark: boolean
  colors: ThemeColors
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(colorScheme === "dark")

  // Update theme when system theme changes
  useEffect(() => {
    setIsDark(colorScheme === "dark")
  }, [colorScheme])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const colors = isDark ? darkTheme : lightTheme

  return <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

