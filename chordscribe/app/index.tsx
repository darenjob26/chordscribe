"use client";

import { useAuth } from "@/providers/auth-provider";
import { Redirect, useRouter,  } from "expo-router";
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
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Redirect href="/(tabs)/playbook" />
  );
}
