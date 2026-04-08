import { Stack } from "expo-router";
import { StackLayout } from "@/src/components/common/StackLayout";

export default function DeckLayout() {
  return (
    <StackLayout>
      <Stack.Screen name="new" options={{ title: "New Deck" }} />
      <Stack.Screen name="[id]" options={{ title: "Deck" }} />
    </StackLayout>
  );
}
