"use client";

import { MainLayout } from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { styles } from "@/styles/styles";
import { useRouter } from "expo-router";
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
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to ChordScribe</Text>
        <Text style={styles.subtitle}>
          Select Playbook or Session from the menu to get started.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => router.push("/playbook")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Go to Playbooks</Text>
          </Button>

          <Button onPress={() => router.push("/session")} style={styles.button}>
            <Text style={styles.buttonText}>Go to Sessions</Text>
          </Button>
        </View>
      </View>
    </MainLayout>
  );
}
