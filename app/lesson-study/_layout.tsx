import { Stack } from "expo-router";
import { StackLayout } from "@/src/components/common/StackLayout";

export default function LessonStudyLayout() {
  return (
    <StackLayout backButtonTestID="lesson-study-back-button">
      <Stack.Screen name="[number]" options={{ title: "Practice" }} />
    </StackLayout>
  );
}
