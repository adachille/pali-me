import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext, itemRepository, type Item, type ItemInsert } from "@/db";
import { ItemForm } from "@/components/items";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItem = useCallback(async () => {
    if (!id) return;

    try {
      const result = await itemRepository.getById(db, Number(id));
      if (result) {
        setItem(result);
      } else {
        setError("Card not found");
      }
    } catch (err) {
      console.error("Failed to load item:", err);
      setError("Failed to load card");
    } finally {
      setIsLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleSubmit = async (values: ItemInsert) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await itemRepository.update(db, Number(id), values);
      router.back();
    } catch (err) {
      console.error("Failed to update item:", err);
      Alert.alert("Error", "Failed to save changes. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Card", "Delete this card? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          try {
            await itemRepository.deleteItem(db, Number(id));
            router.back();
          } catch (err) {
            console.error("Failed to delete item:", err);
            Alert.alert("Error", "Failed to delete card. Please try again.");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer} testID="edit-item-screen">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.centerContainer} testID="edit-item-screen">
        <Text style={styles.errorText}>{error ?? "Card not found"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="edit-item-screen">
      <ItemForm
        initialValues={item}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
      />
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
    },
  });
}
