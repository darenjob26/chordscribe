"use client"

import type React from "react"
import { useState } from "react"
import { View, StyleSheet, useWindowDimensions } from "react-native"
import { Drawer } from "react-native-drawer-layout"
import { SafeAreaView } from "react-native-safe-area-context"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [open, setOpen] = useState(false)
  const dimensions = useWindowDimensions()
  const isLargeScreen = dimensions.width >= 768

  return (
    <View style={styles.container}>
      {isLargeScreen ? (
        <View style={styles.largeScreenContainer}>
          <View style={styles.sidebarContainer}>
            <Sidebar />
          </View>
          <View style={styles.contentContainer}>
            <SafeAreaView style={styles.content}>{children}</SafeAreaView>
          </View>
        </View>
      ) : (
        <Drawer
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          renderDrawerContent={() => <Sidebar onClose={() => setOpen(false)} />}
          drawerType="slide"
          drawerStyle={styles.drawer}
        >
          <SafeAreaView style={styles.content}>
            <Header onMenuPress={() => setOpen(true)} />
            {children}
          </SafeAreaView>
        </Drawer>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  largeScreenContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebarContainer: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  drawer: {
    width: 280,
  },
})

