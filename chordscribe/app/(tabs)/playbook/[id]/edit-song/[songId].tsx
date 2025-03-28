import { Text, View } from "react-native";

export default function EditSongPage({
  params,
}: {
  params: { id: string; songId: string };
}) {
  return (
    <View>
      <Text>Edit song</Text>
    </View>
  );
}
