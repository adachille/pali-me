import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useTheme } from "@/theme";

export default function DeckLayout() {
  const router = useRouter();
  const { colors, colorScheme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        headerShadowVisible: colorScheme === "light",
        headerLeft: () => (
          <Pressable onPress={() => router.back()} hitSlop={8} testID="back-button">
            <Ionicons name="chevron-back" size={28} color={colors.tabBarActive} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="new" options={{ title: "New Deck" }} />
      <Stack.Screen name="[id]" options={{ title: "Deck" }} />
    </Stack>
  );
}
