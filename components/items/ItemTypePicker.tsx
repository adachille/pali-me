import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ItemType } from "@/db";
import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";

type ItemTypePickerProps = {
  value: ItemType;
  onChange: (type: ItemType) => void;
};

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: "word", label: "Word" },
  { value: "prefix", label: "Prefix" },
  { value: "suffix", label: "Suffix" },
  { value: "root", label: "Root" },
  { value: "particle", label: "Particle" },
];

export function ItemTypePicker({ value, onChange }: ItemTypePickerProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container} testID="item-type-picker">
      <Text style={styles.label}>Type</Text>
      <View style={styles.options}>
        {ITEM_TYPES.map((type) => (
          <Pressable
            key={type.value}
            style={[styles.option, value === type.value && styles.optionSelected]}
            onPress={() => onChange(type.value)}
            testID={`type-option-${type.value}`}
          >
            <Text style={[styles.optionText, value === type.value && styles.optionTextSelected]}>
              {type.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    options: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    option: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    optionTextSelected: {
      color: colors.textOnPrimary,
      fontWeight: "500",
    },
  });
}
