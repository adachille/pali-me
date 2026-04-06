import type { LessonContent, NodeState, NodeType } from "@/data/lessons/types";
import type { AppColors } from "@/theme";
import { useTheme } from "@/theme";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LessonNode } from "./LessonNode";

type NodeInfo = {
  type: NodeType;
  state: NodeState;
  label: string;
};

type Props = {
  lesson: LessonContent;
  nodes: NodeInfo[];
  onNodePress: (type: NodeType) => void;
};

export function LessonMapItem({ lesson, nodes, onNodePress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container} testID={`lesson-map-item-${lesson.lesson_number}`}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.topic}>{lesson.topic}</Text>
      <View style={styles.nodesRow}>
        {nodes.map((node) => (
          <LessonNode
            key={node.type}
            state={node.state}
            type={node.type}
            label={node.label}
            onPress={() => onNodePress(node.type)}
          />
        ))}
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 2,
    },
    topic: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    nodesRow: {
      flexDirection: "row",
      gap: 12,
    },
  });
}
