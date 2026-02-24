import { deckRepository, useSQLiteContext } from "@/db";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";

type DeckFormModalProps = {
  visible: boolean;
  initialName?: string;
  deckId?: number;
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
};

export function DeckFormModal({
  visible,
  initialName,
  deckId,
  onSave,
  onClose,
  onDelete,
}: DeckFormModalProps) {
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = deckId !== undefined;

  useEffect(() => {
    if (visible) {
      setName(initialName ?? "");
      setError(null);
    }
  }, [visible, initialName]);

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Deck name is required");
      return;
    }

    if (trimmedName.toLowerCase() === "all") {
      setError('Cannot use reserved name "All"');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const exists = await deckRepository.nameExists(db, trimmedName, deckId);
      if (exists) {
        setError("A deck with this name already exists");
        setIsSaving(false);
        return;
      }

      if (isEditMode) {
        await deckRepository.update(db, deckId, trimmedName);
      } else {
        await deckRepository.create(db, trimmedName);
      }

      onSave();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save deck";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.overlayBackground} onPress={handleClose} />
        <View style={styles.modalContent} testID="deck-form-modal">
          <Text style={styles.modalTitle}>{isEditMode ? "Rename Deck" : "New Deck"}</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Deck Name</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="e.g., Verbs, Daily Study"
              placeholderTextColor={colors.textHint}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(null);
              }}
              autoFocus
              maxLength={50}
              testID="deck-name-input"
            />
            {error && (
              <Text style={styles.errorText} testID="deck-form-error">
                {error}
              </Text>
            )}
            <Text style={styles.hint}>{name.length}/50 characters</Text>
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={handleClose}
              disabled={isSaving}
              testID="deck-form-cancel"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.saveButton,
                pressed && styles.pressed,
                isSaving && styles.disabled,
              ]}
              onPress={handleSave}
              disabled={isSaving}
              testID="deck-form-save"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>{isEditMode ? "Save" : "Create"}</Text>
              )}
            </Pressable>
          </View>

          {isEditMode && onDelete && (
            <Pressable
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              onPress={onDelete}
              disabled={isSaving}
              testID="deck-form-delete"
            >
              <Text style={styles.deleteButtonText}>Delete Deck</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    overlayBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 12,
      width: "85%",
      maxWidth: 400,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 16,
    },
    form: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.textPrimary,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginTop: 8,
    },
    hint: {
      color: colors.textHint,
      fontSize: 12,
      marginTop: 8,
      textAlign: "right",
    },
    buttons: {
      flexDirection: "row",
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButton: {
      backgroundColor: colors.surface,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    pressed: {
      opacity: 0.8,
    },
    disabled: {
      backgroundColor: colors.primaryDisabled,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textOnPrimary,
    },
    deleteButton: {
      marginTop: 16,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.errorBackground,
    },
    deleteButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.error,
    },
  });
}
