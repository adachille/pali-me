import { Stack } from "expo-router";

export default function ItemLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="add" options={{ title: "Add Item" }} />
      <Stack.Screen name="[id]" options={{ title: "Edit Item" }} />
    </Stack>
  );
}
