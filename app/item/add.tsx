import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext, itemRepository, type ItemInsert } from "@/db";
import { ItemForm } from "@/components/items";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { ThemeColors } from "@/constants/theme";

export default function AddItemScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ItemInsert) => {
    setIsSubmitting(true);
    try {
      await itemRepository.create(db, values);
      router.back();
    } catch (error) {
      console.error("Failed to create item:", error);
      Alert.alert("Error", "Failed to create card. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container} testID="add-item-screen">
      <ItemForm onSubmit={handleSubmit} submitLabel="Add Card" isSubmitting={isSubmitting} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
  });
}
