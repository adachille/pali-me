import { Stack } from "expo-router";
import { StackLayout } from "@/src/components/common/StackLayout";

export default function LessonLayout() {
  return (
    <StackLayout backButtonTestID="lesson-back-button">
      <Stack.Screen name="[number]" options={{ title: "Lesson" }} />
    </StackLayout>
  );
}
