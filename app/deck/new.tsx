import { deckRepository, useSQLiteContext } from "@/db";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function NewDeckScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleSave = async () => {
    const trimmedName = name.trim();

    // Client-side validation
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
      const deck = await deckRepository.create(db, trimmedName);
      router.replace(`/deck/${deck.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create deck";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (name.trim()) {
      Alert.alert("Discard changes?", "Your deck will not be saved.", [
        { text: "Keep Editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      testID="new-deck-screen"
    >
      <View style={styles.form}>
        <Text style={styles.label}>Deck Name</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="e.g., Verbs, Daily Study"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(null);
          }}
          autoFocus
          maxLength={50}
          testID="deck-name-input"
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        <Text style={styles.hint}>{name.length}/50 characters</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
          onPress={handleCancel}
          disabled={isSaving}
          testID="cancel-button"
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
          testID="save-button"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Create Deck</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    form: {
      flex: 1,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
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
      color: colors.text,
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
      color: colors.textTertiary,
      fontSize: 12,
      marginTop: 8,
      textAlign: "right",
    },
    buttons: {
      flexDirection: "row",
      gap: 12,
      paddingBottom: 20,
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
      backgroundColor: colors.primaryLight,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
  });
}
