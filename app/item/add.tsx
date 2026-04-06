import { ItemForm } from "@/components/items";
import { itemRepository, useSQLiteContext, type ItemInsert } from "@/db";
import type { AppColors } from "@/theme";
import { useTheme } from "@/theme";
import { showAlert } from "@/utils/alert";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

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
