import { useAuth } from "@/providers/auth-provider";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, View, Text } from "react-native";

export default function AccountScreen() {
    const { signOut } = useAuth();
    return <View>
        <Text>Account</Text>
        <TouchableOpacity
            className="flex-row items-center p-3 rounded-lg border border-gray-200"
            onPress={signOut}
        >
            <Feather name="log-out" size={18} color="black" />
            <Text className="ml-2 text-sm" style={{ color: "black" }}>
                Logout
            </Text>
        </TouchableOpacity>
    </View>
}
