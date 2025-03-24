"use client"

import type React from "react"
import { useState } from "react"
import { View, useWindowDimensions } from "react-native"
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
    <View className="flex-1">
      {isLargeScreen ? (
        <View className="flex-1 flex-row">
          <View className="w-[280px] border-r border-gray-200">
            <Sidebar />
          </View>
          <View className="flex-1">
            <SafeAreaView className="flex-1">{children}</SafeAreaView>
          </View>
        </View>
      ) : (
        <Drawer
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          renderDrawerContent={() => <Sidebar onClose={() => setOpen(false)} />}
          drawerType="slide"
          drawerStyle={{ width: 280 }}
        >
          <SafeAreaView className="flex-1">
            <Header onMenuPress={() => setOpen(true)} />
            {children}
          </SafeAreaView>
        </Drawer>
      )}
    </View>
  )
}

