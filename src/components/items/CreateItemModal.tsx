import { itemRepository, useSQLiteContext, type ItemInsert } from "@/src/db";
import { useTheme } from "@/src/theme";
import { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ItemForm } from "./ItemForm";

type CreateItemModalProps = {
  visible: boolean;
  onClose: () => void;
  onItemCreated: (itemId: number) => void;
};

export function CreateItemModal({ visible, onClose, onItemCreated }: CreateItemModalProps) {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ItemInsert) => {
    setIsSubmitting(true);
    try {
      const item = await itemRepository.create(db, values);
      onItemCreated(item.id);
      onClose();
    } catch (error) {
      console.error("Failed to create item:", error);
      Alert.alert("Error", "Failed to create card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAndContinue = async (values: ItemInsert) => {
    setIsSubmitting(true);
    try {
      const item = await itemRepository.create(db, values);
      onItemCreated(item.id);
      // Don't close the modal - form will be cleared by ItemForm
    } catch (error) {
      console.error("Failed to create item:", error);
      Alert.alert("Error", "Failed to create card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[styles.container, { backgroundColor: colors.surface }]}
        testID="create-item-modal"
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Create New Card</Text>
          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            onPress={onClose}
            testID="close-create-item-modal"
          >
            <Text style={[styles.closeButtonText, { color: colors.primary }]}>Cancel</Text>
          </Pressable>
        </View>
        <ItemForm
          onSubmit={handleSubmit}
          onSubmitAndContinue={handleSubmitAndContinue}
          submitLabel="Create Card"
          isSubmitting={isSubmitting}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
