import { LessonMapItem } from "@/src/components/lessons";
import { LESSONS, buildNodes } from "@/src/data/lessons";
import type { LessonContent, LessonNodeType } from "@/src/data/lessons/types";
import { lessonRepository, useSQLiteContext } from "@/src/db";
import type { LessonProgress } from "@/src/db/types";
import type { AppColors } from "@/src/theme";
import { useTheme } from "@/src/theme";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

export default function LearnScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList<LessonContent>>(null);
  const hasScrolled = useRef(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const result = await lessonRepository.getAllProgress(db);
          setProgress(result);
        } catch (error) {
          console.error("Failed to load lesson progress:", error);
        } finally {
          setIsLoading(false);
        }
      })();
    }, [db])
  );

  // Precompute all node states once when progress changes
  const allNodes = useMemo(
    () =>
      LESSONS.map((lesson, i) => buildNodes(lesson, i > 0 ? LESSONS[i - 1] : undefined, progress)),
    [progress]
  );

  // Find the frontier lesson index (first lesson with an available node)
  const frontierIndex = useMemo(() => {
    const idx = allNodes.findIndex((nodes) => nodes.some((n) => n.state === "available"));
    return idx >= 0 ? idx : 0;
  }, [allNodes]);

  const handleNodePress = useCallback(
    (lessonNumber: number, nodeType: LessonNodeType) => {
      if (nodeType === "learn") {
        router.push(`/lesson/${lessonNumber}` as `/lesson/${string}`);
      } else {
        const type = nodeType === "vocab_practice" ? "vocab" : "exercise";
        router.push(`/lesson-study/${lessonNumber}?type=${type}` as `/lesson-study/${string}`);
      }
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: LessonContent; index: number }) => (
      <LessonMapItem
        lesson={item}
        nodes={allNodes[index]}
        onNodePress={(type) => handleNodePress(item.lesson_number, type)}
      />
    ),
    [allNodes, handleNodePress]
  );

  const handleContentSizeChange = useCallback(() => {
    if (!hasScrolled.current && frontierIndex > 0 && flatListRef.current) {
      hasScrolled.current = true;
      flatListRef.current.scrollToIndex({
        index: frontierIndex,
        animated: false,
        viewPosition: 0.3,
      });
    }
  }, [frontierIndex]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="learn-screen">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="learn-screen">
      <FlatList
        ref={flatListRef}
        data={LESSONS}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.lesson_number)}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={handleContentSizeChange}
        onScrollToIndexFailed={() => {
          // Fallback: just scroll to beginning
        }}
        testID="lesson-map-list"
      />
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
  });
}
