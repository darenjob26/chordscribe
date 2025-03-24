"use client";

import { MainLayout } from "@/components/layouts/main-layout";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data for playbooks
interface Playbook {
  id: string;
  name: string;
  songCount: number;
  isDefault?: boolean;
}

const initialPlaybooks: Playbook[] = [
  {
    id: "default",
    name: "Your Songs",
    songCount: 12,
    isDefault: true,
  },
  {
    id: "jazz",
    name: "Jazz Standards",
    songCount: 8,
  },
  {
    id: "practice",
    name: "Practice Routines",
    songCount: 5,
  },
  {
    id: "gigs",
    name: "Upcoming Gigs",
    songCount: 3,
  },
  {
    id: "pop",
    name: "Pop Hits",
    songCount: 3,
  },
];

export default function PlaybookScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [playbooks, setPlaybooks] = useState<Playbook[]>(initialPlaybooks);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPlaybookName, setNewPlaybookName] = useState("");

  const handleAddPlaybook = () => {
    if (newPlaybookName.trim()) {
      const newPlaybook: Playbook = {
        id: `playbook-${Date.now()}`,
        name: newPlaybookName,
        songCount: 0,
      };
      setPlaybooks([...playbooks, newPlaybook]);
      setNewPlaybookName("");
      setIsAddDialogOpen(false);
    } else {
      Alert.alert("Error", "Please enter a playbook name");
    }
  };

  const renderPlaybookItem = ({ item }: { item: Playbook }) => (
    <TouchableOpacity
      style={[
        styles.playbookCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => router.push(`/playbook/${item.id}` as any)}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}
      >
        <Feather name="book" size={20} color={colors.primary} />
      </View>
      <View style={styles.playbookInfo}>
        <View style={styles.playbookNameRow}>
          <Text
            style={[styles.playbookName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.isDefault && (
            <Feather name="lock" size={14} color={colors.muted} />
          )}
        </View>
        <Text style={[styles.playbookSongs, { color: colors.muted }]}>
          {item.songCount} {item.songCount === 1 ? "song" : "songs"}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  return (
    <MainLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Your Playbooks
          </Text>
          <Button
            onPress={() => setIsAddDialogOpen(true)}
            leftIcon={<Feather name="folder-plus" size={18} color="white" />}
          >
            <Text style={styles.buttonText}>Add Playbook</Text>
          </Button>
        </View>

        <FlatList
          data={playbooks}
          renderItem={renderPlaybookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Add Playbook Dialog */}
        {isAddDialogOpen && (
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Create New Playbook
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                Enter a name for your new playbook.
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Playbook Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    color: colors.text,
                  },
                ]}
                placeholder="My New Playbook"
                placeholderTextColor={colors.muted}
                value={newPlaybookName}
                onChangeText={setNewPlaybookName}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={() => {
                    setIsAddDialogOpen(false);
                    setNewPlaybookName("");
                  }}
                  style={styles.modalButton}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Button>
                <Button onPress={handleAddPlaybook} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Create</Text>
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 16,
  },
  playbookCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playbookInfo: {
    flex: 1,
  },
  playbookNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playbookName: {
    fontSize: 16,
    fontWeight: "600",
  },
  playbookSongs: {
    fontSize: 14,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
});
