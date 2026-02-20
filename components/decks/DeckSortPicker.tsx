import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { SortOption } from "@/db/repositories/deckRepository";

type DeckSortPickerProps = {
  value: SortOption;
  onChange: (sort: SortOption) => void;
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "count_desc", label: "Most items" },
  { value: "count_asc", label: "Fewest items" },
];

function getSortLabel(value: SortOption): string {
  return SORT_OPTIONS.find((opt) => opt.value === value)?.label ?? "Sort";
}

export function DeckSortPicker({ value, onChange }: DeckSortPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (sort: SortOption) => {
    onChange(sort);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        onPress={() => setModalVisible(true)}
        testID="deck-sort-picker"
      >
        <Text style={styles.triggerText}>{getSortLabel(value)}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort decks by</Text>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.option,
                  option.value === value && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
                onPress={() => handleSelect(option.value)}
                testID={`sort-option-${option.value}`}
              >
                <Text
                  style={[styles.optionText, option.value === value && styles.optionTextSelected]}
                >
                  {option.label}
                </Text>
                {option.value === value && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  triggerPressed: {
    backgroundColor: "#f5f5f5",
  },
  triggerText: {
    fontSize: 14,
    color: "#333",
    marginRight: 6,
  },
  chevron: {
    fontSize: 10,
    color: "#666",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "80%",
    maxWidth: 300,
    paddingVertical: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionPressed: {
    backgroundColor: "#f5f5f5",
  },
  optionSelected: {
    backgroundColor: "#E8F5E9",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  optionTextSelected: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
