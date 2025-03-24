"use client";

import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { styles } from "@/styles/styles";
import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Redirect href="/(tabs)/playbook" />
  );
}
