import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Item, ItemInsert, ItemType } from "@/db";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
import { ItemTypePicker } from "./ItemTypePicker";

type ItemFormProps = {
  initialValues?: Partial<Item>;
  onSubmit: (values: ItemInsert) => Promise<void>;
  onDelete?: () => void;
  submitLabel: string;
  isSubmitting: boolean;
};

export function ItemForm({
  initialValues,
  onSubmit,
  onDelete,
  submitLabel,
  isSubmitting,
}: ItemFormProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [pali, setPali] = useState(initialValues?.pali ?? "");
  const [meaning, setMeaning] = useState(initialValues?.meaning ?? "");
  const [type, setType] = useState<ItemType>(initialValues?.type ?? "word");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [errors, setErrors] = useState<{ pali?: string; meaning?: string }>({});

  const validate = (): boolean => {
    const newErrors: { pali?: string; meaning?: string } = {};

    if (!pali.trim()) {
      newErrors.pali = "Pali text is required";
    }
    if (!meaning.trim()) {
      newErrors.meaning = "Meaning is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      pali: pali.trim(),
      meaning: meaning.trim(),
      type,
      notes: notes.trim() || null,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Pali *</Text>
          <TextInput
            style={[styles.input, errors.pali && styles.inputError]}
            value={pali}
            onChangeText={setPali}
            placeholder="Enter Pali text"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            testID="pali-input"
          />
          {errors.pali && <Text style={styles.errorText}>{errors.pali}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Meaning *</Text>
          <TextInput
            style={[styles.input, errors.meaning && styles.inputError]}
            value={meaning}
            onChangeText={setMeaning}
            placeholder="Enter English meaning"
            placeholderTextColor={colors.placeholder}
            testID="meaning-input"
          />
          {errors.meaning && <Text style={styles.errorText}>{errors.meaning}</Text>}
        </View>

        <ItemTypePicker value={type} onChange={setType} />

        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Etymology, usage examples, etc."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            testID="notes-input"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          testID="submit-button"
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? "Saving..." : submitLabel}</Text>
        </Pressable>

        {onDelete && (
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
            onPress={onDelete}
            testID="delete-button"
          >
            <Text style={styles.deleteButtonText}>Delete Card</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    field: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    inputError: {
      borderColor: colors.error,
    },
    notesInput: {
      minHeight: 100,
      paddingTop: 12,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginTop: 4,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    submitButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    submitButtonDisabled: {
      backgroundColor: colors.textTertiary,
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "600",
    },
    deleteButton: {
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.error,
    },
    deleteButtonPressed: {
      backgroundColor: colors.errorSurface,
    },
    deleteButtonText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: "500",
    },
  });
}
