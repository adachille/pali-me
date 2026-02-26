import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";

type AnswerInputProps = {
  onSubmit: (answer: string) => void;
  disabled: boolean;
};

/**
 * Text input for typing answers with a submit button.
 * Auto-focuses when enabled.
 */
export function AnswerInput({ onSubmit, disabled }: AnswerInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [value, setValue] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!disabled) {
      // Auto-focus when enabled (new card shown)
      setValue("");
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [disabled]);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      Keyboard.dismiss();
      onSubmit(value);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder="Type your answer..."
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSubmit}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        testID="answer-input"
      />
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          (disabled || !value.trim()) && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={disabled || !value.trim()}
        testID="answer-submit"
      >
        <Text style={[styles.buttonText, (disabled || !value.trim()) && styles.buttonTextDisabled]}>
          Submit
        </Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 18,
      color: colors.text,
    },
    inputDisabled: {
      backgroundColor: colors.surface,
      color: colors.textTertiary,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    buttonPressed: {
      opacity: 0.8,
    },
    buttonDisabled: {
      backgroundColor: colors.border,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
    },
    buttonTextDisabled: {
      color: colors.textTertiary,
    },
  });
}
