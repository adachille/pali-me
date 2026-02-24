import { deckRepository, useSQLiteContext } from "@/db";
import { useRouter } from "expo-router";
import { useState } from "react";
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
          placeholderTextColor="#999"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "#f44336",
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginTop: 8,
  },
  hint: {
    color: "#999",
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
    backgroundColor: "#f5f5f5",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    backgroundColor: "#a5d6a7",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
