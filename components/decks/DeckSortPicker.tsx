import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { SortOption } from "@/db/repositories/deckRepository";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";

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
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    triggerPressed: {
      backgroundColor: colors.surface,
    },
    triggerText: {
      fontSize: 14,
      color: colors.text,
      marginRight: 6,
    },
    chevron: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 12,
      width: "80%",
      maxWidth: 300,
      paddingVertical: 8,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    optionPressed: {
      backgroundColor: colors.surface,
    },
    optionSelected: {
      backgroundColor: colors.primarySurface,
    },
    optionText: {
      fontSize: 15,
      color: colors.text,
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: "600",
    },
    checkmark: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: "600",
    },
  });
}
