import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useTheme } from "@/theme";

export default function ItemLayout() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} hitSlop={8} testID="back-button">
            <Ionicons name="chevron-back" size={28} color={colors.tabBarActive} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="add" options={{ title: "Add Item" }} />
      <Stack.Screen name="[id]" options={{ title: "Edit Item" }} />
    </Stack>
  );
}
