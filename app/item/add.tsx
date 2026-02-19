import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext, itemRepository, type ItemInsert } from "@/db";
import { ItemForm } from "@/components/items";

export default function AddItemScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ItemInsert) => {
    setIsSubmitting(true);
    try {
      await itemRepository.create(db, values);
      router.back();
    } catch (error) {
      console.error("Failed to create item:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container} testID="add-item-screen">
      <ItemForm onSubmit={handleSubmit} submitLabel="Add Item" isSubmitting={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
