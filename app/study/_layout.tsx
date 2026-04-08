import { Stack } from "expo-router";
import { StackLayout } from "@/components/common/StackLayout";

export default function StudyLayout() {
  return (
    <StackLayout backButtonTestID="study-back-button">
      <Stack.Screen name="[id]" options={{ title: "Study" }} />
    </StackLayout>
  );
}
