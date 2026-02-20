import { Stack } from "expo-router";

export default function DeckLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="new" options={{ title: "New Deck" }} />
      <Stack.Screen name="[id]" options={{ title: "Deck" }} />
    </Stack>
  );
}
