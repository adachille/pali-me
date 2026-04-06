import { getLessonByNumber } from "@/data/lessons";
import type {
  GrammarExample,
  GrammarTable,
  LessonContent,
  LessonVocabItem,
} from "@/data/lessons/types";
import { lessonRepository, useSQLiteContext } from "@/db";
import type { AppColors } from "@/theme";
import { useTheme } from "@/theme";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function LessonScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const lessonNumber = parseInt(number, 10);
  const lesson = getLessonByNumber(lessonNumber);
  const db = useSQLiteContext();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const progress = await lessonRepository.getProgress(db, lessonNumber, "learn");
        setIsCompleted(progress?.completed ?? false);
      })();
    }, [db, lessonNumber])
  );

  const handleComplete = useCallback(async () => {
    setIsCompleting(true);
    try {
      await lessonRepository.completeNode(db, lessonNumber, "learn");
      router.back();
    } catch (error) {
      console.error("Failed to complete lesson:", error);
      setIsCompleting(false);
    }
  }, [db, lessonNumber, router]);

  if (!lesson) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Lesson {number} not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: lesson.title }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.topic}>Topic: {lesson.topic}</Text>

        {lesson.vocabulary.length > 0 && <VocabSection vocab={lesson.vocabulary} styles={styles} />}

        {lesson.grammar.explanations.length > 0 && (
          <GrammarSection lesson={lesson} styles={styles} />
        )}

        {lesson.grammar.tables.length > 0 && (
          <TablesSection tables={lesson.grammar.tables} styles={styles} colors={colors} />
        )}

        {lesson.grammar.examples.length > 0 && (
          <ExamplesSection examples={lesson.grammar.examples} styles={styles} />
        )}

        <View style={styles.buttonContainer}>
          {isCompleted ? (
            <View style={[styles.button, styles.buttonCompleted]}>
              <Text style={styles.buttonText}>Completed</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleComplete}
              disabled={isCompleting}
              testID="complete-lesson-button"
            >
              {isCompleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Complete Lesson</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </>
  );
}

// ============================================================================
// Section Components
// ============================================================================

function VocabSection({
  vocab,
  styles,
}: {
  vocab: LessonVocabItem[];
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vocabulary</Text>
      {vocab.map((item, i) => (
        <View key={i} style={styles.vocabRow}>
          <Text style={styles.vocabPali}>{item.pali}</Text>
          <Text style={styles.vocabEnglish}>{item.english}</Text>
          <Text style={styles.vocabMeta}>
            {item.type}
            {item.gender ? ` (${item.gender})` : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

function GrammarSection({
  lesson,
  styles,
}: {
  lesson: LessonContent;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Grammar</Text>
      {lesson.grammar.explanations.map((text, i) => (
        <Text key={i} style={styles.paragraph}>
          {text}
        </Text>
      ))}
    </View>
  );
}

function TablesSection({
  tables,
  styles,
  colors,
}: {
  tables: GrammarTable[];
  styles: ReturnType<typeof makeStyles>;
  colors: AppColors;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tables</Text>
      {tables.map((table, ti) => (
        <View key={ti} style={styles.table}>
          <Text style={styles.tableTitle}>{table.title}</Text>
          {table.rows.map((row, ri) => (
            <View
              key={ri}
              style={[styles.tableRow, ri % 2 === 0 && { backgroundColor: colors.surface }]}
            >
              {row.map((cell, ci) => (
                <Text key={ci} style={[styles.tableCell, ci === 0 && styles.tableCellFirst]}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function ExamplesSection({
  examples,
  styles,
}: {
  examples: GrammarExample[];
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Examples</Text>
      {examples.map((ex, i) => (
        <View key={i} style={styles.exampleRow}>
          <Text style={styles.examplePali}>{ex.pali}</Text>
          <Text style={styles.exampleEnglish}>{ex.english}</Text>
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    topic: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 24,
      fontStyle: "italic",
    },

    // Sections
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },

    // Vocabulary
    vocabRow: {
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    vocabPali: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    vocabEnglish: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    vocabMeta: {
      fontSize: 12,
      color: colors.border,
      marginTop: 2,
      fontStyle: "italic",
    },

    // Grammar
    paragraph: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
      marginBottom: 12,
    },

    // Tables
    table: {
      marginBottom: 16,
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    tableTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      padding: 10,
      backgroundColor: colors.surface,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    tableCell: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    tableCellFirst: {
      flex: 0,
      width: 70,
      fontWeight: "600",
      color: colors.textSecondary,
    },

    // Examples
    exampleRow: {
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    examplePali: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
    },
    exampleEnglish: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },

    // Button
    buttonContainer: {
      marginTop: 12,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    buttonPressed: {
      backgroundColor: colors.primaryDark,
    },
    buttonCompleted: {
      opacity: 0.6,
    },
    buttonText: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "700",
    },
  });
}
