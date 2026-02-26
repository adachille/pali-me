import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function StudyLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} hitSlop={8} testID="study-back-button">
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="[id]" options={{ title: "Study" }} />
    </Stack>
  );
}
