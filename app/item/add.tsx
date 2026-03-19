import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { showAlert } from "@/utils/alert";
import { useRouter } from "expo-router";
import { useSQLiteContext, itemRepository, type ItemInsert } from "@/db";
import { ItemForm } from "@/components/items";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";

export default function AddItemScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ItemInsert) => {
    setIsSubmitting(true);
    try {
      await itemRepository.create(db, values);
      router.back();
    } catch (error) {
      console.error("Failed to create item:", error);
      showAlert("Error", "Failed to create card. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSubmitAndContinue = async (values: ItemInsert) => {
    setIsSubmitting(true);
    try {
      await itemRepository.create(db, values);
      // Don't navigate back - form will be cleared by ItemForm
    } catch (error) {
      console.error("Failed to create item:", error);
      showAlert("Error", "Failed to create card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      testID="add-item-screen"
    >
      <ItemForm
        onSubmit={handleSubmit}
        onSubmitAndContinue={handleSubmitAndContinue}
        submitLabel="Add Card"
        isSubmitting={isSubmitting}
      />
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
  });
}
