import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
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

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
  });
}
