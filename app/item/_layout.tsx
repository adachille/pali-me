import { Stack } from "expo-router";
import { StackLayout } from "@/components/common/StackLayout";

export default function ItemLayout() {
  return (
    <StackLayout>
      <Stack.Screen name="add" options={{ title: "Add Item" }} />
      <Stack.Screen name="[id]" options={{ title: "Edit Item" }} />
    </StackLayout>
  );
}
